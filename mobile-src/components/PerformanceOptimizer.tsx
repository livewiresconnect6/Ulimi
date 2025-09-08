import React, { useState, useEffect } from 'react';
import { Zap, Image, Download, Settings } from 'lucide-react';
import { Preferences } from '@capacitor/preferences';

interface PerformanceSettings {
  imageQuality: 'high' | 'medium' | 'low';
  preloadAudio: boolean;
  offlineMode: boolean;
  dataSaver: boolean;
  lazyLoading: boolean;
}

export default function PerformanceOptimizer() {
  const [settings, setSettings] = useState<PerformanceSettings>({
    imageQuality: 'medium',
    preloadAudio: false,
    offlineMode: false,
    dataSaver: false,
    lazyLoading: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadPerformanceSettings();
  }, []);

  const loadPerformanceSettings = async () => {
    try {
      const { value } = await Preferences.get({ key: 'performance_settings' });
      if (value) {
        setSettings(JSON.parse(value));
      }
    } catch (error) {
      console.error('Failed to load performance settings:', error);
    }
  };

  const savePerformanceSettings = async (newSettings: PerformanceSettings) => {
    try {
      setIsLoading(true);
      setSettings(newSettings);
      
      await Preferences.set({
        key: 'performance_settings',
        value: JSON.stringify(newSettings),
      });

      // Apply settings immediately
      applyPerformanceSettings(newSettings);
    } catch (error) {
      console.error('Failed to save performance settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPerformanceSettings = (settings: PerformanceSettings) => {
    // Apply image quality settings
    const images = document.querySelectorAll('img[data-lazy]');
    images.forEach((img) => {
      const element = img as HTMLImageElement;
      if (settings.imageQuality === 'low') {
        element.style.filter = 'blur(0.5px)';
      } else {
        element.style.filter = 'none';
      }
    });

    // Apply lazy loading
    if (settings.lazyLoading) {
      enableLazyLoading();
    }

    // Data saver mode
    if (settings.dataSaver) {
      enableDataSaverMode();
    }
  };

  const enableLazyLoading = () => {
    const images = document.querySelectorAll('img:not([data-lazy-loaded])');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.dataset.lazyLoaded = 'true';
            imageObserver.unobserve(img);
          }
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  };

  const enableDataSaverMode = () => {
    // Reduce image quality
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (img.src && !img.src.includes('quality=')) {
        const url = new URL(img.src);
        url.searchParams.set('quality', '60');
        img.src = url.toString();
      }
    });

    // Disable auto-play for audio
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      audio.preload = 'none';
    });
  };

  const handleSettingChange = (key: keyof PerformanceSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    savePerformanceSettings(newSettings);
  };

  const getImageQualityDescription = (quality: string) => {
    switch (quality) {
      case 'high': return 'Best quality, more data usage';
      case 'medium': return 'Balanced quality and data usage';
      case 'low': return 'Faster loading, less data usage';
      default: return '';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap size={24} className="text-yellow-500" />
        <div>
          <h2 className="text-lg font-semibold">Performance</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optimize app performance for your device
          </p>
        </div>
      </div>

      {/* Image Quality */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Image size={20} className="text-blue-500" />
          <h3 className="font-medium">Image Quality</h3>
        </div>
        
        <div className="space-y-2">
          {(['high', 'medium', 'low'] as const).map((quality) => (
            <label key={quality} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="imageQuality"
                value={quality}
                checked={settings.imageQuality === quality}
                onChange={() => handleSettingChange('imageQuality', quality)}
                className="w-4 h-4 text-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium capitalize">{quality}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {getImageQualityDescription(quality)}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Audio Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Download size={20} className="text-green-500" />
          <h3 className="font-medium">Audio & Downloads</h3>
        </div>
        
        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
          <div>
            <div className="font-medium">Preload Audio</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Download audio files in advance for smoother playback
            </div>
          </div>
          <button
            onClick={() => handleSettingChange('preloadAudio', !settings.preloadAudio)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.preloadAudio ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.preloadAudio ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Data & Performance */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-purple-500" />
          <h3 className="font-medium">Data & Performance</h3>
        </div>
        
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium">Data Saver Mode</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Reduce data usage with lower quality media
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('dataSaver', !settings.dataSaver)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataSaver ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataSaver ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
            <div>
              <div className="font-medium">Lazy Loading</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Load images only when they come into view
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('lazyLoading', !settings.lazyLoading)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.lazyLoading ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.lazyLoading ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Zap size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            <p className="font-medium">Performance Tips</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• Enable data saver on slow connections</li>
              <li>• Download stories for offline reading</li>
              <li>• Close other apps for better performance</li>
              <li>• Restart the app if it becomes slow</li>
            </ul>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Applying settings...</p>
        </div>
      )}
    </div>
  );
}