import { MantineColorsTuple, createTheme, rem } from '@mantine/core'

const brand: MantineColorsTuple = ['#e6fff7', '#ccffef', '#99ffe0', '#66fed0', '#33fbc1', '#00c896', '#009b75', '#007154', '#004935', '#002417']
const night: MantineColorsTuple = ['#f3f5ff', '#e4e8fb', '#c0c8f0', '#9ca8e4', '#7c8bd7', '#5f70cb', '#4959b4', '#384792', '#28366f', '#1a244b']

export const mantineTheme = createTheme({
  fontFamily: 'Nunito Sans, ui-sans-serif, system-ui',
  headings: { fontFamily: 'Poppins, ui-sans-serif, system-ui' },
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 3 },
  colors: {
    brand,
    night,
  },
  defaultRadius: 'md',
  focusRing: 'auto',
  components: {
    Button: {
      defaultProps: {
        radius: 'xl',
        fw: 600,
      },
    },
    Card: {
      defaultProps: {
        radius: 'xl',
        shadow: 'md',
        padding: 'lg',
      },
    },
  },
  spacing: {
    xs: rem(6),
    sm: rem(10),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
})
