import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ulimi.app',
  appName: 'Ulimi - Stories & Audiobooks',
  webDir: 'mobile-build',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark'
    },
    App: {
      launchUrl: ''
    },
    Preferences: {
      group: 'UlimiPrefs'
    },
    Device: {},
    Network: {},
    Haptics: {},
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Filesystem: {},
    Share: {},
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3b82f6',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
