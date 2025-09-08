import { useState, useEffect } from 'react';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';

export interface StoredStory {
  id: string;
  title: string;
  content: string;
  author: string;
  language: string;
  downloadDate: string;
  audioUrl?: string;
  coverImage?: string;
}

export function useOfflineStorage() {
  const [offlineStories, setOfflineStories] = useState<StoredStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadOfflineStories();
  }, []);

  const loadOfflineStories = async () => {
    try {
      setIsLoading(true);
      const { value } = await Preferences.get({ key: 'offline_stories_index' });
      if (value) {
        const storyIndex = JSON.parse(value);
        setOfflineStories(storyIndex);
      }
    } catch (error) {
      console.error('Failed to load offline stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadStory = async (story: StoredStory): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Create unique filename
      const filename = `story_${story.id}.json`;
      
      // Save story content to filesystem
      await Filesystem.writeFile({
        path: `stories/${filename}`,
        data: JSON.stringify(story),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });

      // Download audio file if available
      if (story.audioUrl) {
        await downloadAudioFile(story.id, story.audioUrl);
      }

      // Download cover image if available
      if (story.coverImage) {
        await downloadImageFile(story.id, story.coverImage);
      }

      // Update offline stories index
      const updatedStories = [...offlineStories, story];
      setOfflineStories(updatedStories);
      
      await Preferences.set({
        key: 'offline_stories_index',
        value: JSON.stringify(updatedStories),
      });

      return true;
    } catch (error) {
      console.error('Failed to download story:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadAudioFile = async (storyId: string, audioUrl: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            await Filesystem.writeFile({
              path: `audio/story_${storyId}.mp3`,
              data: reader.result as string,
              directory: Directory.Data,
            });
            resolve(true);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to download audio:', error);
    }
  };

  const downloadImageFile = async (storyId: string, imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            await Filesystem.writeFile({
              path: `images/story_${storyId}.jpg`,
              data: reader.result as string,
              directory: Directory.Data,
            });
            resolve(true);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const getOfflineStory = async (storyId: string): Promise<StoredStory | null> => {
    try {
      const filename = `story_${storyId}.json`;
      const file = await Filesystem.readFile({
        path: `stories/${filename}`,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      return JSON.parse(file.data as string);
    } catch (error) {
      console.error('Failed to get offline story:', error);
      return null;
    }
  };

  const removeOfflineStory = async (storyId: string): Promise<boolean> => {
    try {
      // Remove story file
      await Filesystem.deleteFile({
        path: `stories/story_${storyId}.json`,
        directory: Directory.Data,
      });

      // Remove audio file if exists
      try {
        await Filesystem.deleteFile({
          path: `audio/story_${storyId}.mp3`,
          directory: Directory.Data,
        });
      } catch {}

      // Remove image file if exists
      try {
        await Filesystem.deleteFile({
          path: `images/story_${storyId}.jpg`,
          directory: Directory.Data,
        });
      } catch {}

      // Update index
      const updatedStories = offlineStories.filter(story => story.id !== storyId);
      setOfflineStories(updatedStories);
      
      await Preferences.set({
        key: 'offline_stories_index',
        value: JSON.stringify(updatedStories),
      });

      return true;
    } catch (error) {
      console.error('Failed to remove offline story:', error);
      return false;
    }
  };

  const getStorageUsage = async (): Promise<{ totalSize: number; storyCount: number }> => {
    try {
      let totalSize = 0;
      const storyCount = offlineStories.length;
      
      // Calculate total storage used by offline stories
      for (const story of offlineStories) {
        try {
          const storyFile = await Filesystem.stat({
            path: `stories/story_${story.id}.json`,
            directory: Directory.Data,
          });
          totalSize += storyFile.size;
        } catch {}
      }
      
      return { totalSize, storyCount };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { totalSize: 0, storyCount: 0 };
    }
  };

  return {
    offlineStories,
    isLoading,
    downloadStory,
    getOfflineStory,
    removeOfflineStory,
    getStorageUsage,
    refreshOfflineStories: loadOfflineStories,
  };
}