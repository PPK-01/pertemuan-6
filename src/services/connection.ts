import { Platform } from 'react-native';

export type ConnectionListener = (isConnected: boolean) => void;

let isOnlineState = true;
const listeners = new Set<ConnectionListener>();

try {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      isOnlineState = window.navigator.onLine;
      window.addEventListener('online', () => {
        isOnlineState = true;
        notify(true);
      });
      window.addEventListener('offline', () => {
        isOnlineState = false;
        notify(false);
      });
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const NetInfo = require('@react-native-community/netinfo');
    const netinfo = NetInfo.default || NetInfo;
    if (netinfo && typeof netinfo.addEventListener === 'function') {
      netinfo.addEventListener((state: { isConnected: boolean | null; isInternetReachable?: boolean | null }) => {
        const connected = Boolean(state.isConnected && state.isInternetReachable !== false);
        isOnlineState = connected;
        notify(connected);
      });
    }
  }
} catch {
  // Tetap online jika NetInfo native belum tersedia di APK
  isOnlineState = true;
}

function notify(connected: boolean) {
  listeners.forEach((listener) => {
    try {
      listener(connected);
    } catch {
      // Abaikan error di callback
    }
  });
}

export const connectionService = {
  get isConnected(): boolean {
    return isOnlineState;
  },
  subscribe(listener: ConnectionListener): () => void {
    listeners.add(listener);
    listener(isOnlineState);
    return () => {
      listeners.delete(listener);
    };
  },
};
