import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.forge',
  appName: 'Forge',
  webDir: 'dist/app/browser',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_timer',
      presentationOptions: ['badge', 'sound', 'banner'],
    },
  },
};

export default config;
