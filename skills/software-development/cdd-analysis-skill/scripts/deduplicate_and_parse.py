#!/usr/bin/env python3
"""Inject stable CDD trace IDs into HTML prototypes and emit dedupe JSON.

The script intentionally uses only the Python standard library so the skill can run
inside small CI/agent environments without installing parser dependencies.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import shutil
from dataclasses import dataclass, field
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable

IGNORED_TAGS = {"html", "head", "body", "script", "style", "meta", "link", "title", "br", "svg", "path"}
ATOM_TAGS = {"button", "a", "input", "label", "span", "img", "small", "strong", "em", "p", "h1", "h2", "h3", "h4", "li"}
MOLECULE_TAGS = {"form", "fieldset", "article", "section", "header", "footer", "nav", "ul", "ol"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def prefix_for(tag: str) -> str:
    if tag in ATOM_TAGS:
        return "atm"
    if tag in MOLECULE_TAGS:
        return "mol"
    return "org"


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def attrs_to_string(attrs: list[tuple[str, str | None]]) -> str:
    parts: list[str] = []
    for key, value in attrs:
        if value is None:
            parts.append(key)
        else:
            escaped = html.escape(value, quote=True)
            parts.append(f'{key}="{escaped}"')
    return (" " + " ".join(parts)) if parts else ""


def normalized_attrs(attrs: list[tuple[str, str | None]]) -> list[tuple[str, str]]:
    result: list[tuple[str, str]] = []
    for key, value in attrs:
        if key.startswith("data-agent-id") or key == "cdd-id":
            continue
        result.append((key, normalize_text(value or "")))
    return sorted(result)


@dataclass
class OpenNode:
    tag: str
    cdd_id: str | None
    attrs: list[tuple[str, str]]
    text_parts: list[str] = field(default_factory=list)
    child_signatures: list[str] = field(default_factory=list)


@dataclass
class ComponentRecord:
    cdd_id: str
    tag: str
    file: str
    classification_hint: str
    text: str
    attrs: list[tuple[str, str]]
    content_hash: str
    duplicate_of: str | None = None


class CddHtmlParser(HTMLParser):
    def __init__(self, source_file: Path, counters: dict[str, int]):
        super().__init__(convert_charrefs=False)
        self.source_file = source_file
        self.counters = counters
        self.output: list[str] = []
        self.stack: list[OpenNode] = []
        self.records: list[ComponentRecord] = []

    def next_id(self, prefix: str) -> str:
        self.counters[prefix] = self.counters.get(prefix, 0) + 1
        return f"{prefix}-{self.counters[prefix]:03d}"

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        should_trace = tag not in IGNORED_TAGS
        cdd_id = self.next_id(prefix_for(tag)) if should_trace else None
        emitted_attrs = list(attrs)
        if cdd_id:
            emitted_attrs.append(("data-agent-id", cdd_id))
        self.output.append(f"<{tag}{attrs_to_string(emitted_attrs)}>")
        self.stack.append(OpenNode(tag=tag, cdd_id=cdd_id, attrs=normalized_attrs(attrs)))
        if tag in VOID_TAGS:
            self._close_node(tag, emit_end=False)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        should_trace = tag not in IGNORED_TAGS
        cdd_id = self.next_id(prefix_for(tag)) if should_trace else None
        emitted_attrs = list(attrs)
        if cdd_id:
            emitted_attrs.append(("data-agent-id", cdd_id))
        self.output.append(f"<{tag}{attrs_to_string(emitted_attrs)} />")
        if cdd_id:
            digest = self._digest(tag, normalized_attrs(attrs), "", [])
            self.records.append(
                ComponentRecord(cdd_id, tag, str(self.source_file), prefix_for(tag), "", normalized_attrs(attrs), digest)
            )

    def handle_endtag(self, tag: str) -> None:
        self._close_node(tag, emit_end=True)

    def handle_data(self, data: str) -> None:
        self.output.append(data)
        if self.stack and normalize_text(data):
            self.stack[-1].text_parts.append(normalize_text(data))

    def handle_entityref(self, name: str) -> None:
        self.output.append(f"&{name};")
        if self.stack:
            self.stack[-1].text_parts.append(html.unescape(f"&{name};"))

    def handle_charref(self, name: str) -> None:
        self.output.append(f"&#{name};")
        if self.stack:
            self.stack[-1].text_parts.append(html.unescape(f"&#{name};"))

    def handle_comment(self, data: str) -> None:
        self.output.append(f"<!--{data}-->")

    def handle_decl(self, decl: str) -> None:
        self.output.append(f"<!{decl}>")

    def _close_node(self, tag: str, emit_end: bool) -> None:
        if emit_end:
            self.output.append(f"</{tag}>")
        if not self.stack:
            return
        node = self.stack.pop()
        text = normalize_text(" ".join(node.text_parts))
        digest = self._digest(node.tag, node.attrs, text, node.child_signatures)
        if node.cdd_id:
            self.records.append(
                ComponentRecord(node.cdd_id, node.tag, str(self.source_file), prefix_for(node.tag), text, node.attrs, digest)
            )
        if self.stack:
            self.stack[-1].child_signatures.append(digest)
            if text:
                self.stack[-1].text_parts.append(text)

    @staticmethod
    def _digest(tag: str, attrs: list[tuple[str, str]], text: str, child_signatures: Iterable[str]) -> str:
        payload = json.dumps(
            {"tag": tag, "attrs": attrs, "text": text, "children": sorted(child_signatures)},
            ensure_ascii=False,
            sort_keys=True,
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def parse_file(source: Path, source_root: Path, output_root: Path, counters: dict[str, int]) -> list[ComponentRecord]:
    parser = CddHtmlParser(source.relative_to(source_root), counters)
    parser.feed(source.read_text(encoding="utf-8"))
    parser.close()
    target = output_root / source.relative_to(source_root)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("".join(parser.output), encoding="utf-8")
    return parser.records


def build_payload(prototype_dir: Path, output_dir: Path, records: list[ComponentRecord]) -> dict:
    by_hash: dict[str, list[ComponentRecord]] = {}
    for record in records:
        by_hash.setdefault(record.content_hash, []).append(record)

    for grouped in by_hash.values():
        master = grouped[0].cdd_id
        for record in grouped[1:]:
            record.duplicate_of = master

    duplicate_groups = []
    for digest, grouped in by_hash.items():
        if len(grouped) < 2:
            continue
        duplicate_groups.append(
            {
                "content_hash": digest,
                "canonical_cdd_id": grouped[0].cdd_id,
                "occurrence_count": len(grouped),
                "occurrences": [
                    {"cdd_id": r.cdd_id, "file": r.file, "tag": r.tag, "duplicate_of": r.duplicate_of} for r in grouped
                ],
            }
        )

    file_hashes = {}
    for path in sorted(prototype_dir.rglob("*.html")):
        rel = str(path.relative_to(prototype_dir))
        file_hashes[rel] = hashlib.sha256(path.read_bytes()).hexdigest()

    return {
        "schema_version": "1.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "prototype_dir": str(prototype_dir),
        "processed_dir": str(output_dir),
        "file_hashes": file_hashes,
        "components": [
            {
                "cdd_id": r.cdd_id,
                "tag": r.tag,
                "file": r.file,
                "classification_hint": r.classification_hint,
                "text": r.text,
                "attrs": dict(r.attrs),
                "content_hash": r.content_hash,
                "duplicate_of": r.duplicate_of,
            }
            for r in records
        ],
        "duplicate_groups": duplicate_groups,
    }


def main() -> int:
    argp = argparse.ArgumentParser()
    argp.add_argument("--prototype-dir", required=True, type=Path)
    argp.add_argument("--output-dir", required=True, type=Path)
    argp.add_argument("--json-out", required=True, type=Path)
    argp.add_argument("--zip-out", type=Path)
    args = argp.parse_args()

    prototype_dir = args.prototype_dir.resolve()
    output_dir = args.output_dir.resolve()
    if not prototype_dir.exists():
        raise SystemExit(f"Prototype dir not found: {prototype_dir}")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    counters: dict[str, int] = {"atm": 0, "mol": 0, "org": 0}
    records: list[ComponentRecord] = []
    for path in sorted(prototype_dir.rglob("*.html")):
        records.extend(parse_file(path, prototype_dir, output_dir, counters))

    payload = build_payload(prototype_dir, output_dir, records)
    args.json_out.parent.mkdir(parents=True, exist_ok=True)
    args.json_out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.zip_out:
        if args.zip_out.exists():
            args.zip_out.unlink()
        shutil.make_archive(str(args.zip_out.with_suffix("")), "zip", output_dir)

    print(json.dumps({"components": len(records), "duplicate_groups": len(payload["duplicate_groups"])}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
