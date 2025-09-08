import { useState, useEffect } from 'react';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';

export interface MobileDeviceInfo {
  platform: string;
  model: string;
  operatingSystem: string;
  osVersion: string;
  isVirtual: boolean;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
}

export function useMobileFeatures() {
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ connected: true, connectionType: 'unknown' });
  const [appState, setAppState] = useState<string>('active');

  useEffect(() => {
    initializeMobileFeatures();
    setupListeners();
    
    return () => {
      // Cleanup listeners
    };
  }, []);

  const initializeMobileFeatures = async () => {
    try {
      // Get device information
      const device = await Device.getInfo();
      setDeviceInfo({
        platform: device.platform,
        model: device.model,
        operatingSystem: device.operatingSystem,
        osVersion: device.osVersion,
        isVirtual: device.isVirtual,
      });

      // Get network status
      const status = await Network.getStatus();
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    } catch (error) {
      console.error('Failed to initialize mobile features:', error);
    }
  };

  const setupListeners = () => {
    // App state listener
    App.addListener('appStateChange', ({ isActive }) => {
      setAppState(isActive ? 'active' : 'background');
    });

    // Network status listener
    Network.addListener('networkStatusChange', (status) => {
      setNetworkStatus({
        connected: status.connected,
        connectionType: status.connectionType,
      });
    });
  };

  // Storage helpers
  const saveToStorage = async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  };

  const getFromStorage = async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('Failed to get from storage:', error);
      return null;
    }
  };

  const removeFromStorage = async (key: string) => {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  };

  // App control
  const exitApp = () => {
    App.exitApp();
  };

  const minimizeApp = () => {
    App.minimizeApp();
  };

  return {
    deviceInfo,
    networkStatus,
    appState,
    storage: {
      save: saveToStorage,
      get: getFromStorage,
      remove: removeFromStorage,
    },
    controls: {
      exit: exitApp,
      minimize: minimizeApp,
    },
  };
}