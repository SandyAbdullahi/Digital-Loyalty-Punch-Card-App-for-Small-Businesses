import { createTheme } from '@mantine/core';

export const theme = createTheme({
  colors: {
    primary: ['#E6F7FF', '#BAE7FF', '#91D5FF', '#69C0FF', '#40A9FF', '#1890FF', '#096DD9', '#0050B3', '#003A8C', '#002766'],
    accent: ['#E6FFF7', '#BFFFE6', '#99FFD0', '#73FFBB', '#4DFF99', '#3EDC9D', '#2DB37A', '#1C8C57', '#0B6634', '#004011'],
    darkCharcoal: ['#F2F2F2', '#D9D9D9', '#BFBFBF', '#A6A6A6', '#8C8C8C', '#737373', '#595959', '#404040', '#2D2D2D', '#1A1A1A'],
    lightGrey: ['#FFFFFF', '#FAFAFA', '#F5F6F7', '#E0E0E0', '#C7C7C7', '#AEAEAE', '#959595', '#7C7C7C', '#636363', '#4A4A4A'],
    white: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
    red: ['#FFEEEE', '#FFDDDD', '#FFCCCC', '#FFBBBB', '#FFAAAA', '#FF5E5E', '#CC4B4B', '#993838', '#662626', '#331313'],
    darkBackground: ['#212121', '#1A1A1A', '#121212', '#0A0A0A', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
    darkSurface: ['#333333', '#2B2B2B', '#1E1E1E', '#171717', '#101010', '#101010', '#101010', '#101010', '#101010', '#101010'],
    darkText: ['#FFFFFF', '#F5F5F5', '#E0E0E0', '#CCCCCC', '#B3B3B3', '#999999', '#808080', '#666666', '#4D4D4D', '#333333'],
  },
  fontFamily: 'Inter, Poppins, sans-serif',
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  fontWeights: {
    regular: 400,
    heading: 600,
    bold: 700,
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 10px 15px -5px, rgba(0, 0, 0, 0.04) 0px 7px 7px -5px',
    md: '0 4px 8px rgba(0,0,0,0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
});