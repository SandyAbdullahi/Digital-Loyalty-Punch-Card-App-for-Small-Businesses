export type ThemeMode = 'light' | 'dark'

export type ThemeSettingsPayload = {
  theme_primary_color?: string
  theme_secondary_color?: string
  theme_accent_color?: string
  theme_background_color?: string
  theme_mode?: ThemeMode
}

type PresetTheme = {
  id: string
  label: string
  description: string
  source: string
  swatches: string[]
  values: Required<ThemeSettingsPayload>
}

export type ThemePreset = PresetTheme

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'rudi-brand',
    label: 'Rudi Brand',
    description: 'Teal primary, espresso neutrals, and sand backdrop from the landing page.',
    source: 'Rudi design system',
    swatches: ['#009688', '#3B1F1E', '#FFB300', '#FDF6EC'],
    values: {
      theme_primary_color: '#009688',
      theme_secondary_color: '#3B1F1E',
      theme_accent_color: '#FFB300',
      theme_background_color: '#FDF6EC',
      theme_mode: 'light'
    }
  },
  {
    id: 'rudi-soft',
    label: 'Rudi Soft',
    description: 'Calmer latte background with deeper teal contrast for dense dashboards.',
    source: 'Rudi design system',
    swatches: ['#007F73', '#2B1A19', '#FF9F43', '#F7EFE2'],
    values: {
      theme_primary_color: '#007F73',
      theme_secondary_color: '#2B1A19',
      theme_accent_color: '#FF9F43',
      theme_background_color: '#F7EFE2',
      theme_mode: 'light'
    }
  },
  {
    id: 'rudi-midnight',
    label: 'Rudi Midnight',
    description: 'Dark surface for late-night ops with teal and amber highlights.',
    source: 'Rudi design system',
    swatches: ['#00BFA5', '#E8DEC9', '#FFB300', '#0B0F14'],
    values: {
      theme_primary_color: '#00BFA5',
      theme_secondary_color: '#E8DEC9',
      theme_accent_color: '#FFB300',
      theme_background_color: '#0B0F14',
      theme_mode: 'dark'
    }
  }
]

export const DEFAULT_PRESET_ID = PRESET_THEMES[0].id

export const DEFAULT_THEME: Required<ThemeSettingsPayload> = PRESET_THEMES[0].values

const normalizeHex = (value?: string, fallback?: string) => {
  if (!value || typeof value !== 'string') return fallback ?? '#ffffff'
  if (/^#[0-9a-fA-F]{3,8}$/.test(value.trim())) {
    return value.trim()
  }
  return fallback ?? '#ffffff'
}

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.split('').map((char) => char + char).join('') : value.padEnd(6, '0')
  const num = parseInt(normalized, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (value: number) => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const blendColors = (colorA: string, colorB: string, ratio: number) => {
  const clampRatio = Math.min(1, Math.max(0, ratio))
  const rgbA = hexToRgb(colorA)
  const rgbB = hexToRgb(colorB)
  const r = rgbA.r * clampRatio + rgbB.r * (1 - clampRatio)
  const g = rgbA.g * clampRatio + rgbB.g * (1 - clampRatio)
  const b = rgbA.b * clampRatio + rgbB.b * (1 - clampRatio)
  return rgbToHex(r, g, b)
}

const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  const channel = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrastRatio = (backgroundHex: string, foregroundHex: string) => {
  const L1 = relativeLuminance(backgroundHex)
  const L2 = relativeLuminance(foregroundHex)
  const [Lmax, Lmin] = L1 >= L2 ? [L1, L2] : [L2, L1]
  return (Lmax + 0.05) / (Lmin + 0.05)
}

const MIN_CONTRAST_RATIO = 4.5
const HIGH_CONTRAST_LIGHT = '#FFFFFF'
const HIGH_CONTRAST_DARK = '#0B1220'

const getContrastColor = (hex: string, minRatio = MIN_CONTRAST_RATIO) => {
  const bg = normalizeHex(hex, '#000000')
  const options = [
    { color: HIGH_CONTRAST_DARK, ratio: contrastRatio(bg, HIGH_CONTRAST_DARK) },
    { color: HIGH_CONTRAST_LIGHT, ratio: contrastRatio(bg, HIGH_CONTRAST_LIGHT) },
  ]

  options.sort((a, b) => b.ratio - a.ratio)
  const best = options[0]
  if (best.ratio >= minRatio) return best.color

  // If neither meets the threshold (rare), push the better option closer to pure black/white.
  let candidate = best.color
  const target = best.color === HIGH_CONTRAST_DARK ? '#000000' : '#FFFFFF'
  for (let i = 0; i < 3 && contrastRatio(bg, candidate) < minRatio; i++) {
    candidate = blendColors(candidate, target, 0.75)
  }
  return candidate
}

const adjustColor = (hex: string, amount: number) => {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.repeat(2) : value.padEnd(6, '0')
  const num = parseInt(normalized, 16)
  const clamp = (channel: number) => Math.min(255, Math.max(0, channel))
  const delta = (amount / 100) * 255
  const r = clamp(((num >> 16) & 0xff) + delta)
  const g = clamp(((num >> 8) & 0xff) + delta)
  const b = clamp((num & 0xff) + delta)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1, 7)}`
}

const ensureSidebarShade = (hex: string, isDarkMode: boolean) => {
  const luminance = relativeLuminance(hex)
  if (!isDarkMode && luminance > 0.92) {
    return adjustColor(hex, -12)
  }
  if (!isDarkMode && luminance < 0.25) {
    return adjustColor(hex, 12)
  }
  if (isDarkMode && luminance < 0.12) {
    return adjustColor(hex, 18)
  }
  if (isDarkMode && luminance > 0.55) {
    return adjustColor(hex, -18)
  }
  return hex
}

export const extractThemeFromSettings = (settings?: Partial<ThemeSettingsPayload>) => {
  return {
    theme_primary_color: normalizeHex(
      settings?.theme_primary_color,
      DEFAULT_THEME.theme_primary_color
    ),
    theme_secondary_color: normalizeHex(
      settings?.theme_secondary_color,
      DEFAULT_THEME.theme_secondary_color
    ),
    theme_accent_color: normalizeHex(
      settings?.theme_accent_color,
      DEFAULT_THEME.theme_accent_color
    ),
    theme_background_color: normalizeHex(
      settings?.theme_background_color,
      DEFAULT_THEME.theme_background_color
    ),
    theme_mode: settings?.theme_mode ?? DEFAULT_THEME.theme_mode
  }
}

export const applyTheme = (theme?: Partial<ThemeSettingsPayload>) => {
  if (typeof document === 'undefined') {
    return
  }

  const normalized = extractThemeFromSettings(theme)
  const root = document.documentElement

  const isDark = normalized.theme_mode === 'dark'
  const baseLightBackground = '#FDF6EC'
  const baseDarkBackground = '#0B0F14'
  const background = isDark
    ? blendColors(normalized.theme_background_color, baseDarkBackground, 0.55)
    : blendColors(normalized.theme_background_color, baseLightBackground, 0.65)
  const foreground = isDark ? '#E8ECF5' : '#0B1220'
  const card = isDark ? '#0F1424' : '#FFFFFF'
  const cardForeground = isDark ? '#F3F6FD' : '#0B1220'
  const surface = isDark ? '#0B101D' : blendColors('#FFFFFF', background, 0.6)
  const surfaceMuted = isDark ? '#11172A' : '#E8EDF5'
  const surfaceContrast = isDark ? '#070A14' : '#DDE4F0'
  const popover = card
  const popoverForeground = cardForeground
  const muted = isDark ? '#151B2D' : '#E4E9F2'
  const mutedForeground = isDark ? '#BAC4D8' : '#4B5565'
  const border = isDark ? '#1E2538' : '#D5DEEA'
  const input = isDark ? '#151C2E' : '#DCE3EF'
  const inputForeground = isDark ? '#F3F6FD' : '#0B1220'
  const sidebarBlend = isDark ? 0.45 : 0.5
  let sidebar = blendColors(normalized.theme_primary_color, background, sidebarBlend)
  sidebar = ensureSidebarShade(sidebar, isDark)
  const sidebarForeground = getContrastColor(sidebar)
  const sidebarHover = ensureSidebarShade(blendColors(sidebar, sidebarForeground, isDark ? 0.18 : 0.12), isDark)
  const sidebarActive = ensureSidebarShade(
    blendColors(normalized.theme_secondary_color, sidebar, isDark ? 0.5 : 0.42),
    isDark
  )
  const sidebarActiveForeground = getContrastColor(sidebarActive)
  const sidebarBorder = blendColors(
    sidebar,
    sidebarForeground === '#FFFFFF' ? '#000000' : '#FFFFFF',
    isDark ? 0.35 : 0.2
  )
  const destructive = normalized.theme_accent_color
  const destructiveForeground = getContrastColor(destructive)

  const entries: Array<[string, string]> = [
    ['--primary', normalized.theme_primary_color],
    ['--primary-foreground', getContrastColor(normalized.theme_primary_color)],
    ['--secondary', normalized.theme_secondary_color],
    ['--secondary-foreground', getContrastColor(normalized.theme_secondary_color)],
    ['--accent', normalized.theme_accent_color],
    ['--accent-foreground', getContrastColor(normalized.theme_accent_color)],
    ['--ring', normalized.theme_primary_color],
    ['--background', background],
    ['--foreground', foreground],
    ['--card', card],
    ['--card-foreground', cardForeground],
    ['--popover', popover],
    ['--popover-foreground', popoverForeground],
    ['--destructive', destructive],
    ['--destructive-foreground', destructiveForeground],
    ['--muted', muted],
    ['--muted-foreground', mutedForeground],
    ['--border', border],
    ['--input', input],
    ['--input-foreground', inputForeground],
    ['--surface', surface],
    ['--surface-muted', surfaceMuted],
    ['--surface-contrast', surfaceContrast],
    ['--sidebar', sidebar],
    ['--sidebar-foreground', sidebarForeground],
    ['--sidebar-hover', sidebarHover],
    ['--sidebar-active', sidebarActive],
    ['--sidebar-active-foreground', sidebarActiveForeground],
    ['--sidebar-border', sidebarBorder],
  ]

  entries.forEach(([token, value]) => {
    root.style.setProperty(token, value)
  })

  root.dataset.themeMode = normalized.theme_mode
  root.style.setProperty('color-scheme', isDark ? 'dark' : 'light')
  document.body.style.backgroundColor = background
  document.body.style.color = foreground
}
