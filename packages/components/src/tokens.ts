export interface Tokens {
  fontFamily: string
  color: {
    text: string
    muted: string
    border: string
    borderStrong: string
    accent: string
  }
  space: { xs: number; sm: number; md: number; lg: number; xl: number }
  fontSize: {
    sm: number
    base: number
    md: number
    lg: number
    xl: number
    xxl: number
  }
  fontWeight: { regular: number; bold: number }
  lineHeight: { tight: number; normal: number }
  radius: { sm: number; md: number }
  page: { paddingVertical: number; paddingHorizontal: number }
}

export const defaultTokens: Tokens = {
  fontFamily: 'Pretendard',
  color: {
    text: '#1a1a1a',
    muted: '#6b7280',
    border: '#e5e7eb',
    borderStrong: '#1a1a1a',
    accent: '#2563eb',
  },
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    sm: 9,
    base: 11,
    md: 13,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  fontWeight: {
    regular: 400,
    bold: 700,
  },
  lineHeight: {
    tight: 1.3,
    normal: 1.6,
  },
  radius: {
    sm: 4,
    md: 6,
  },
  page: {
    paddingVertical: 56,
    paddingHorizontal: 48,
  },
}

export const tokens = defaultTokens

export type TokensOverride = {
  [K in keyof Tokens]?: Tokens[K] extends object ? Partial<Tokens[K]> : Tokens[K]
}

export function createTokens(overrides: TokensOverride = {}): Tokens {
  return {
    fontFamily: overrides.fontFamily ?? defaultTokens.fontFamily,
    color: { ...defaultTokens.color, ...overrides.color },
    space: { ...defaultTokens.space, ...overrides.space },
    fontSize: { ...defaultTokens.fontSize, ...overrides.fontSize },
    fontWeight: { ...defaultTokens.fontWeight, ...overrides.fontWeight },
    lineHeight: { ...defaultTokens.lineHeight, ...overrides.lineHeight },
    radius: { ...defaultTokens.radius, ...overrides.radius },
    page: { ...defaultTokens.page, ...overrides.page },
  }
}

export const darkTheme: Tokens = createTokens({
  color: {
    text: '#f3f4f6',
    muted: '#9ca3af',
    border: '#374151',
    borderStrong: '#e5e7eb',
    accent: '#60a5fa',
  },
})
