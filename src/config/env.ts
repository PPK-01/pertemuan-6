/**
 * Konfigurasi Environment Aplikasi (EXPO_PUBLIC_*)
 * Membaca variabel environment runtime dengan validasi aman.
 */

export const env = {
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    get isConfigured(): boolean {
      return (
        Boolean(this.apiKey) &&
        Boolean(this.projectId) &&
        !this.apiKey.includes('YOUR_') &&
        !this.projectId.includes('YOUR_')
      );
    },
  },
  ai: {
    url: process.env.EXPO_PUBLIC_AI_URL ?? '',
    key: process.env.EXPO_PUBLIC_AI_KEY ?? '',
    get isConfigured(): boolean {
      return (
        Boolean(this.url) &&
        this.url.startsWith('http') &&
        !this.url.includes('YOUR_')
      );
    },
  },
};
