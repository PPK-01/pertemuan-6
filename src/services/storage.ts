import { Platform } from 'react-native';

interface StorageBackend {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// In-Memory Storage Fallback
const memoryMap = new Map<string, string>();
const memoryStorage: StorageBackend = {
  getItem: async (key: string) => memoryMap.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    memoryMap.set(key, value);
  },
  removeItem: async (key: string) => {
    memoryMap.delete(key);
  },
};

let resolvedStorage: StorageBackend = memoryStorage;

try {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.localStorage) {
      resolvedStorage = {
        getItem: async (k) => window.localStorage.getItem(k),
        setItem: async (k, v) => window.localStorage.setItem(k, v),
        removeItem: async (k) => window.localStorage.removeItem(k),
      };
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asyncStorageModule = require('@react-native-async-storage/async-storage');
    resolvedStorage = asyncStorageModule.default || asyncStorageModule;
  }
} catch {
  // Gunakan fallback in-memory jika modul native belum dikompilasi ke APK
  resolvedStorage = memoryStorage;
}

export const safeStorage = resolvedStorage;
