import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import './index.css';
import App from './App.tsx';
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { theme } from './tokens';

function Main() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
        <App />
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

