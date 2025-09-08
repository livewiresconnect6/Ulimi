import React, { useState } from 'react';
import { Download, Trash2, Wifi, WifiOff, HardDrive } from 'lucide-react';
import { useOfflineStorage, StoredStory } from '../hooks/useOfflineStorage';
import { useMobileFeatures } from '../hooks/useMobileFeatures';

interface OfflineStoryManagerProps {
  story: {
    id: string;
    title: string;
    content: string;
    author: string;
    language: string;
    audioUrl?: string;
    coverImage?: string;
  };
}

export default function OfflineStoryManager({ story }: OfflineStoryManagerProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { downloadStory, removeOfflineStory, offlineStories } = useOfflineStorage();
  const { networkStatus } = useMobileFeatures();

  const isOfflineAvailable = offlineStories.some(s => s.id === story.id);

  const handleDownload = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    
    const storyToDownload: StoredStory = {
      ...story,
      downloadDate: new Date().toISOString(),
    };

    const success = await downloadStory(storyToDownload);
    
    if (success) {
      console.log('Story downloaded successfully');
    } else {
      console.error('Failed to download story');
    }
    
    setIsDownloading(false);
  };

  const handleRemove = async () => {
    const success = await removeOfflineStory(story.id);
    
    if (success) {
      console.log('Story removed from offline storage');
    } else {
      console.error('Failed to remove story');
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        {networkStatus.connected ? (
          <Wifi size={16} className="text-green-500" />
        ) : (
          <WifiOff size={16} className="text-red-500" />
        )}
        
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isOfflineAvailable ? 'Available offline' : 'Online only'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {!isOfflineAvailable ? (
          <button
            onClick={handleDownload}
            disabled={isDownloading || !networkStatus.connected}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={14} />
                Download
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRemove}
            className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export function OfflineStorageStatus() {
  const { offlineStories, getStorageUsage } = useOfflineStorage();
  const [storageInfo, setStorageInfo] = useState<{ totalSize: number; storyCount: number }>({
    totalSize: 0,
    storyCount: 0,
  });

  React.useEffect(() => {
    updateStorageInfo();
  }, [offlineStories]);

  const updateStorageInfo = async () => {
    const info = await getStorageUsage();
    setStorageInfo(info);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <HardDrive size={20} className="text-blue-500" />
        <h3 className="font-medium">Offline Storage</h3>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Stories downloaded:</span>
          <span className="font-medium">{storageInfo.storyCount}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Storage used:</span>
          <span className="font-medium">{formatBytes(storageInfo.totalSize)}</span>
        </div>
        
        {storageInfo.storyCount > 0 && (
          <div className="pt-2">
            <div className="text-xs text-green-600 dark:text-green-400">
              ✓ Stories available offline for reading without internet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}