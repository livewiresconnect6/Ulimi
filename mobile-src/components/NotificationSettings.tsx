import React from 'react';
import { Bell, BellOff, Book, Users, Clock, Mail } from 'lucide-react';
import { usePushNotifications, NotificationPreferences } from '../hooks/usePushNotifications';

export default function NotificationSettings() {
  const {
    isEnabled,
    preferences,
    updateNotificationPreferences,
    enableNotifications,
    disableNotifications,
  } = usePushNotifications();

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    updateNotificationPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const notificationTypes = [
    {
      key: 'newStories' as keyof NotificationPreferences,
      icon: Book,
      title: 'New Stories',
      description: 'Get notified when new stories are published',
    },
    {
      key: 'authorUpdates' as keyof NotificationPreferences,
      icon: Users,
      title: 'Author Updates',
      description: 'Notifications from authors you follow',
    },
    {
      key: 'readingReminders' as keyof NotificationPreferences,
      icon: Clock,
      title: 'Reading Reminders',
      description: 'Daily reminders to continue reading',
    },
    {
      key: 'weeklyDigest' as keyof NotificationPreferences,
      icon: Mail,
      title: 'Weekly Digest',
      description: 'Weekly summary of new content and updates',
    },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell size={24} className="text-blue-500" />
          ) : (
            <BellOff size={24} className="text-gray-400" />
          )}
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggleNotifications}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isEnabled && (
        <div className="space-y-4">
          <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
            Notification Types
          </h3>
          
          <div className="space-y-3">
            {notificationTypes.map(({ key, icon: Icon, title, description }) => (
              <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Icon size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {title}
                    </h4>
                    
                    <button
                      onClick={() => handlePreferenceChange(key, !preferences[key])}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        preferences[key] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          preferences[key] ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Bell size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Stay Updated</p>
                <p className="text-xs mt-1">
                  Notifications help you discover new stories and stay connected with your favorite authors.
                  You can change these settings anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isEnabled && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <BellOff size={32} className="text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Notifications Disabled
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            Enable notifications to stay updated with new stories and author updates.
          </p>
          <button
            onClick={handleToggleNotifications}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium"
          >
            Enable Notifications
          </button>
        </div>
      )}
    </div>
  );
}