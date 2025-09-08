import { useState, useEffect } from 'react';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';

export interface NotificationPreferences {
  newStories: boolean;
  authorUpdates: boolean;
  readingReminders: boolean;
  weeklyDigest: boolean;
}

export function usePushNotifications() {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newStories: true,
    authorUpdates: true,
    readingReminders: false,
    weeklyDigest: true,
  });

  useEffect(() => {
    initializePushNotifications();
    loadNotificationPreferences();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        setIsEnabled(true);
      }

      // Listen for registration
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        setPushToken(token.value);
        savePushToken(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push received: ' + JSON.stringify(notification));
        handleNotificationReceived(notification);
      });

      // Listen for notification actions
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push action performed: ' + JSON.stringify(notification));
        handleNotificationAction(notification);
      });

    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const { value } = await Preferences.get({ key: 'notification_preferences' });
      if (value) {
        setPreferences(JSON.parse(value));
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };

  const updateNotificationPreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setPreferences(newPreferences);
      await Preferences.set({
        key: 'notification_preferences',
        value: JSON.stringify(newPreferences),
      });
      
      // Send preferences to server
      if (pushToken) {
        await sendPreferencesToServer(pushToken, newPreferences);
      }
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const savePushToken = async (token: string) => {
    try {
      await Preferences.set({ key: 'push_token', value: token });
      
      // Send token to your server
      await sendTokenToServer(token);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  };

  const sendTokenToServer = async (token: string) => {
    try {
      // Replace with your server endpoint
      await fetch('/api/push/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: 'android',
          preferences,
        }),
      });
    } catch (error) {
      console.error('Failed to send token to server:', error);
    }
  };

  const sendPreferencesToServer = async (token: string, prefs: NotificationPreferences) => {
    try {
      await fetch('/api/push/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          preferences: prefs,
        }),
      });
    } catch (error) {
      console.error('Failed to send preferences to server:', error);
    }
  };

  const handleNotificationReceived = (notification: any) => {
    // Handle incoming push notification
    console.log('Notification received:', notification);
    
    // You can show a custom notification UI here
    // or update app state based on notification content
  };

  const handleNotificationAction = (notification: ActionPerformed) => {
    // Handle user tapping on notification
    const { actionId, data } = notification.notification;
    
    switch (actionId) {
      case 'tap':
        // Navigate to specific story or page
        if (data?.storyId) {
          // Navigate to story
          console.log('Navigate to story:', data.storyId);
        }
        break;
      case 'reply':
        // Handle quick reply action
        break;
      default:
        console.log('Unknown notification action:', actionId);
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, delay: number = 0) => {
    try {
      // For local notifications, you would use the Local Notifications plugin
      // This is a placeholder for demonstration
      console.log('Scheduling local notification:', { title, body, delay });
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
    }
  };

  const enableNotifications = async () => {
    try {
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();
        setIsEnabled(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      return false;
    }
  };

  const disableNotifications = async () => {
    try {
      // Remove token from server
      if (pushToken) {
        await fetch('/api/push/unregister', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: pushToken }),
        });
      }
      
      setIsEnabled(false);
      setPushToken(null);
      await Preferences.remove({ key: 'push_token' });
    } catch (error) {
      console.error('Failed to disable notifications:', error);
    }
  };

  return {
    pushToken,
    isEnabled,
    preferences,
    updateNotificationPreferences,
    scheduleLocalNotification,
    enableNotifications,
    disableNotifications,
  };
}