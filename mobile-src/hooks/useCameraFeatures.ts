import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface CapturedImage {
  webPath: string;
  format: string;
  saved: boolean;
  fileName?: string;
}

export function useCameraFeatures() {
  const [isLoading, setIsLoading] = useState(false);

  const takePhoto = async (): Promise<CapturedImage | null> => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      return {
        webPath: image.webPath || '',
        format: image.format,
        saved: false,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async (): Promise<CapturedImage | null> => {
    try {
      setIsLoading(true);
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      return {
        webPath: image.webPath || '',
        format: image.format,
        saved: false,
      };
    } catch (error) {
      console.error('Error selecting photo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const savePhoto = async (photo: Photo, fileName?: string): Promise<CapturedImage | null> => {
    try {
      setIsLoading(true);
      
      // Generate unique filename if not provided
      const savedFileName = fileName || `photo_${Date.now()}.${photo.format}`;
      
      // Convert photo to base64 if needed
      let base64Data = '';
      if (photo.base64String) {
        base64Data = photo.base64String;
      } else if (photo.webPath) {
        // Fetch the photo and convert to base64
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        base64Data = await convertBlobToBase64(blob);
      }

      // Save to device storage
      await Filesystem.writeFile({
        path: `photos/${savedFileName}`,
        data: base64Data,
        directory: Directory.Data,
      });

      return {
        webPath: photo.webPath || '',
        format: photo.format,
        saved: true,
        fileName: savedFileName,
      };
    } catch (error) {
      console.error('Error saving photo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePhoto = async (fileName: string): Promise<boolean> => {
    try {
      await Filesystem.deleteFile({
        path: `photos/${fileName}`,
        directory: Directory.Data,
      });
      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  };

  const loadSavedPhotos = async (): Promise<string[]> => {
    try {
      const photoDir = await Filesystem.readdir({
        path: 'photos',
        directory: Directory.Data,
      });
      
      return photoDir.files.map(file => file.name);
    } catch (error) {
      console.error('Error loading saved photos:', error);
      return [];
    }
  };

  const getPhotoPath = async (fileName: string): Promise<string | null> => {
    try {
      const photo = await Filesystem.readFile({
        path: `photos/${fileName}`,
        directory: Directory.Data,
      });
      
      return `data:image/jpeg;base64,${photo.data}`;
    } catch (error) {
      console.error('Error getting photo path:', error);
      return null;
    }
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const requestCameraPermissions = async (): Promise<boolean> => {
    try {
      const permissions = await Camera.requestPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error requesting camera permissions:', error);
      return false;
    }
  };

  const checkCameraPermissions = async (): Promise<boolean> => {
    try {
      const permissions = await Camera.checkPermissions();
      return permissions.camera === 'granted';
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  };

  return {
    isLoading,
    takePhoto,
    selectFromGallery,
    savePhoto,
    deletePhoto,
    loadSavedPhotos,
    getPhotoPath,
    requestCameraPermissions,
    checkCameraPermissions,
  };
}