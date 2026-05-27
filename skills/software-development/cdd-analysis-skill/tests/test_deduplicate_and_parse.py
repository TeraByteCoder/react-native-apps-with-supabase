import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


class DeduplicateAndParseTests(unittest.TestCase):
    def test_parser_injects_cdd_ids_and_reports_duplicate_components(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            prototype = root / "prototype"
            auth = prototype / "auth"
            overview = prototype / "overview"
            auth.mkdir(parents=True)
            overview.mkdir(parents=True)

            repeated_button = '<button class="primary">Start Workout</button>'
            (auth / "landing.html").write_text(
                f"<!doctype html><html><body><main><h1>Kinetic Coach</h1>{repeated_button}</main></body></html>",
                encoding="utf-8",
            )
            (overview / "overview.html").write_text(
                f"<!doctype html><html><body><section><h2>Heute</h2>{repeated_button}</section></body></html>",
                encoding="utf-8",
            )

            output_dir = root / "processed"
            json_out = root / "deduplicated-components.json"

            result = subprocess.run(
                [
                    sys.executable,
                    str(Path(__file__).parents[1] / "scripts" / "deduplicate_and_parse.py"),
                    "--prototype-dir",
                    str(prototype),
                    "--output-dir",
                    str(output_dir),
                    "--json-out",
                    str(json_out),
                ],
                text=True,
                capture_output=True,
            )

            self.assertEqual(result.returncode, 0, result.stderr)
            processed_html = (output_dir / "auth" / "landing.html").read_text(encoding="utf-8")
            self.assertIn('data-agent-id="atm-', processed_html)
            self.assertTrue(json_out.exists())

            payload = json.loads(json_out.read_text(encoding="utf-8"))
            duplicate_groups = [group for group in payload["duplicate_groups"] if group["occurrence_count"] == 2]
            self.assertTrue(duplicate_groups, payload)
            self.assertTrue(all("cdd_id" in item for item in duplicate_groups[0]["occurrences"]))


if __name__ == "__main__":
    unittest.main()
