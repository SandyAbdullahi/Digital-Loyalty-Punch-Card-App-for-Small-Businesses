import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rudi.customer',
  appName: 'Rudi',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // Use HTTP inside the WebView so we can talk to a local HTTP backend
    // without hitting mixed-content errors.
    androidScheme: 'http',
  },
};

export default config;
