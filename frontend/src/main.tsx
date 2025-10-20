import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import './index.css';
import App from './App.tsx';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { theme } from './tokens';

function Main() {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(preferredColorScheme);
  const toggleColorScheme = () =>
    setColorScheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <MantineProvider theme={theme} defaultColorScheme={colorScheme}>
      <ColorSchemeScript defaultColorScheme={colorScheme} />
      <App />
    </MantineProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);

