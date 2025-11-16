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
    id: 'neo-mint-flow',
    label: 'Neo Mint Flow',
    description: 'Balanced teal + cobalt base with a vibrant coral accent.',
    source: 'Adobe Color UI/UX · Neo Mint Flow',
    swatches: ['#00C896', '#2196F3', '#FF5252', '#F5F5F5'],
    values: {
      theme_primary_color: '#00C896',
      theme_secondary_color: '#2196F3',
      theme_accent_color: '#FF5252',
      theme_background_color: '#F5F5F5',
      theme_mode: 'light'
    }
  },
  {
    id: 'digital-bloom',
    label: 'Digital Bloom',
    description: 'Playful magenta and lavender with a warm gold highlight.',
    source: 'Adobe Color UI/UX · Digital Bloom',
    swatches: ['#FF7A8A', '#8B5CF6', '#FFC75F', '#FFF6F4'],
    values: {
      theme_primary_color: '#FF7A8A',
      theme_secondary_color: '#8B5CF6',
      theme_accent_color: '#FFC75F',
      theme_background_color: '#FFF6F4',
      theme_mode: 'light'
    }
  },
  {
    id: 'solar-dawn',
    label: 'Solar Dawn',
    description: 'Desert sunrise oranges grounded with muted rose.',
    source: 'Adobe Color UI/UX · Solar Dawn',
    swatches: ['#FF9770', '#FFC75F', '#F45B69', '#FFF4EC'],
    values: {
      theme_primary_color: '#FF9770',
      theme_secondary_color: '#FFC75F',
      theme_accent_color: '#F45B69',
      theme_background_color: '#FFF4EC',
      theme_mode: 'light'
    }
  },
  {
    id: 'noir-neon',
    label: 'Noir Neon',
    description: 'Deep charcoal canvas with electric cyan + amber hits.',
    source: 'Adobe Color UI/UX · Noir Neon',
    swatches: ['#82F3FF', '#FF7ED4', '#FFC857', '#050505'],
    values: {
      theme_primary_color: '#82F3FF',
      theme_secondary_color: '#FF7ED4',
      theme_accent_color: '#FFC857',
      theme_background_color: '#050505',
      theme_mode: 'dark'
    }
  },
  {
    id: 'midnight-grid',
    label: 'Midnight Grid',
    description: 'Indigo interface with synthwave teal + cherry accents.',
    source: 'Adobe Color UI/UX · Midnight Grid',
    swatches: ['#6C63FF', '#51E5FF', '#FF6584', '#080B1A'],
    values: {
      theme_primary_color: '#6C63FF',
      theme_secondary_color: '#51E5FF',
      theme_accent_color: '#FF6584',
      theme_background_color: '#080B1A',
      theme_mode: 'dark'
    }
  },
  {
    id: 'coastal-mist',
    label: 'Coastal Mist',
    description: 'Ocean blues with a citrus pop on a foggy backdrop.',
    source: 'Adobe Color UI/UX · Coastal Mist',
    swatches: ['#2E5A88', '#4FB3BF', '#F1A208', '#EFF4F8'],
    values: {
      theme_primary_color: '#2E5A88',
      theme_secondary_color: '#4FB3BF',
      theme_accent_color: '#F1A208',
      theme_background_color: '#EFF4F8',
      theme_mode: 'light'
    }
  },
  {
    id: 'aurora-matrix',
    label: 'Aurora Matrix',
    description: 'Neo-mint gradients with cobalt UI chrome and amber KPI chips.',
    source: 'Adobe Color UI/UX · Aurora Matrix',
    swatches: ['#00CBA9', '#0B84F3', '#F4B400', '#EAF9FF'],
    values: {
      theme_primary_color: '#00CBA9',
      theme_secondary_color: '#0B84F3',
      theme_accent_color: '#F4B400',
      theme_background_color: '#EAF9FF',
      theme_mode: 'light'
    }
  },
  {
    id: 'velvet-ember',
    label: 'Velvet Ember',
    description: 'Cinematic crimson + honey gradient on twilight plum.',
    source: 'Adobe Color UI/UX · Velvet Ember',
    swatches: ['#FF5F6D', '#FFC371', '#7F96FF', '#120F16'],
    values: {
      theme_primary_color: '#FF5F6D',
      theme_secondary_color: '#FFC371',
      theme_accent_color: '#7F96FF',
      theme_background_color: '#120F16',
      theme_mode: 'dark'
    }
  },
  {
    id: 'cyber-lime',
    label: 'Cyber Lime',
    description: 'High-contrast lime + aqua cues for futuristic dashboards.',
    source: 'Adobe Color UI/UX · Cyber Lime',
    swatches: ['#B5FF00', '#00F5D4', '#FF3F81', '#040C0E'],
    values: {
      theme_primary_color: '#B5FF00',
      theme_secondary_color: '#00F5D4',
      theme_accent_color: '#FF3F81',
      theme_background_color: '#040C0E',
      theme_mode: 'dark'
    }
  },
  {
    id: 'nordic-hush',
    label: 'Nordic Hush',
    description: 'Calming sage neutrals with amber highlights.',
    source: 'Adobe Color UI/UX · Nordic Hush',
    swatches: ['#6B9080', '#A4C3B2', '#F6BD60', '#F7F4ED'],
    values: {
      theme_primary_color: '#6B9080',
      theme_secondary_color: '#A4C3B2',
      theme_accent_color: '#F6BD60',
      theme_background_color: '#F7F4ED',
      theme_mode: 'light'
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

const getContrastColor = (hex: string) => {
  const value = hex.replace('#', '')
  const bigint = parseInt(value.length === 3 ? value.repeat(2) : value, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF'
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
  const background = isDark ? '#05060A' : normalized.theme_background_color
  const foreground = isDark ? '#F7F9FC' : '#1A1A1A'
  const card = isDark ? '#101322' : '#FFFFFF'
  const cardForeground = isDark ? '#F7F9FC' : '#1A1A1A'
  const surface = isDark ? '#0B0E19' : '#FFFFFF'
  const surfaceMuted = isDark ? '#161A2C' : '#F5F6FA'
  const surfaceContrast = isDark ? '#05060A' : '#FDFDFD'
  const popover = card
  const popoverForeground = cardForeground
  const muted = isDark ? '#1F2334' : '#EDEDED'
  const mutedForeground = isDark ? '#D7DBE7' : '#5A5A5A'
  const border = isDark ? '#2B3044' : '#E6E6E6'
  const input = isDark ? '#15192A' : '#E6E6E6'
  const inputForeground = isDark ? '#F7F9FC' : '#1A1A1A'
  const sidebarBlend = isDark ? 0.35 : 0.65
  let sidebar = blendColors(normalized.theme_primary_color, background, sidebarBlend)
  sidebar = ensureSidebarShade(sidebar, isDark)
  const sidebarForeground = getContrastColor(sidebar)
  const sidebarHover = ensureSidebarShade(blendColors(sidebar, sidebarForeground, isDark ? 0.15 : 0.1), isDark)
  const sidebarActive = ensureSidebarShade(
    blendColors(normalized.theme_secondary_color, sidebar, isDark ? 0.55 : 0.45),
    isDark
  )
  const sidebarActiveForeground = getContrastColor(sidebarActive)
  const sidebarBorder = blendColors(
    sidebar,
    sidebarForeground === '#FFFFFF' ? '#000000' : '#FFFFFF',
    isDark ? 0.25 : 0.15
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
