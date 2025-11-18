import { MantineColorsTuple, createTheme, rem } from '@mantine/core'

// Rudi brand palette anchored in teal + espresso, with darker stops for legibility.
const brand: MantineColorsTuple = ['#e8f7f4', '#c7ebe5', '#91d4c9', '#5cbdad', '#31a894', '#0f917d', '#007f73', '#00675f', '#00564f', '#003f3a']
const night: MantineColorsTuple = ['#f6f0e6', '#ebdec8', '#d8c09a', '#c4a16e', '#af8449', '#9e6d2f', '#8c5c25', '#754a1d', '#603c18', '#453012']

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
