export const kineticColors = {
  background: '#000000',
  surfaceContainerLow: '#05080d',
  surfaceContainer: '#0b111a',
  surfaceContainerHigh: '#101923',
  surfaceVariant: '#17212f',
  surfaceBright: '#1f2a37',
  outline: '#526174',
  outlineVariant: '#1f2a37',
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onSurfaceVariant: '#94a3b8',
  primary: '#7dd3fc',
  primaryDim: '#38bdf8',
  onPrimary: '#00111c',
  secondary: '#bae6fd',
  tertiary: '#67e8f9',
  error: '#fda4af'
} as const;

export const kineticSpacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  containerMargin: 24,
  inlineGap: 16,
  stackGap: 24,
  cardPadding: 16
} as const;

export const kineticRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 9999
} as const;

export const kineticTypography = {
  displayXL: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800' as const,
    letterSpacing: -0.64
  },
  headlineLG: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800' as const,
    letterSpacing: -0.24
  },
  titleMD: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800' as const
  },
  bodyBase: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const
  },
  bodySM: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const
  },
  labelCaps: {
    fontSize: 10,
    lineHeight: 10,
    fontWeight: '800' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const
  }
} as const;

export const kineticTheme = {
  colors: kineticColors,
  spacing: kineticSpacing,
  radius: kineticRadius,
  typography: kineticTypography
} as const;

export type KineticTheme = typeof kineticTheme;
