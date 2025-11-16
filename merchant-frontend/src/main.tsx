import React from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { useDocumentColorScheme } from './hooks/useDocumentColorScheme';
import { mantineTheme } from './theme/mantineTheme';
import './index.css';
import './styles/animations.css';
import './config/api';

const RootApp = () => {
  const colorScheme = useDocumentColorScheme();

  return (
    <>
      <ColorSchemeScript defaultColorScheme="light" />
      <MantineProvider
        theme={mantineTheme}
        defaultColorScheme="light"
        forceColorScheme={colorScheme}
        withCssVariables
      >
        <AuthProvider>
          <WebSocketProvider>
            <App />
          </WebSocketProvider>
        </AuthProvider>
      </MantineProvider>
    </>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
