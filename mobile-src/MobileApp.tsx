import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';

// Import your existing web app components
import { BrowserRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mobile-specific components
import MobileNavigation from './components/MobileNavigation';
import MobileSplashScreen from './components/MobileSplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

export default function MobileApp() {
  const [isReady, setIsReady] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    initializeMobileApp();
  }, []);

  const initializeMobileApp = async () => {
    try {
      // Configure status bar for mobile
      await StatusBar.setStyle({ style: 'DARK' });
      await StatusBar.setBackgroundColor({ color: '#000000' });

      // Set up keyboard listeners
      Keyboard.addListener('keyboardWillShow', () => {
        setKeyboardOpen(true);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardOpen(false);
      });

      // Set up app state listeners
      App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active?', isActive);
      });

      // Add haptic feedback for interactions
      const addHapticFeedback = () => {
        Haptics.impact({ style: ImpactStyle.Light });
      };

      // Add click listeners for haptic feedback
      document.addEventListener('click', addHapticFeedback);

      // Hide splash screen after initialization
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 2000);

      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize mobile app:', error);
      setIsReady(true); // Continue anyway
    }
  };

  if (!isReady) {
    return <MobileSplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className={`mobile-app ${keyboardOpen ? 'keyboard-open' : ''}`}>
          {/* Your existing web app content */}
          <div className="app-content">
            {/* Import your existing App component here */}
            {/* <App /> */}
          </div>
          
          {/* Mobile-specific navigation */}
          <MobileNavigation />
          
          {/* Keep existing toaster */}
          <Toaster />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}