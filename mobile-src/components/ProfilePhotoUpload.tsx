import React, { useState } from 'react';
import { Camera, Upload, User, Trash2 } from 'lucide-react';
import { useCameraFeatures, CapturedImage } from '../hooks/useCameraFeatures';

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  onPhotoUpdate: (photoUrl: string) => void;
  userName: string;
}

export default function ProfilePhotoUpload({ currentPhoto, onPhotoUpdate, userName }: ProfilePhotoUploadProps) {
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const {
    isLoading,
    takePhoto,
    selectFromGallery,
    savePhoto,
    requestCameraPermissions,
    checkCameraPermissions,
  } = useCameraFeatures();

  const handleTakePhoto = async () => {
    const hasPermission = await checkCameraPermissions();
    if (!hasPermission) {
      const granted = await requestCameraPermissions();
      if (!granted) {
        alert('Camera permission is required to take photos');
        return;
      }
    }

    const photo = await takePhoto();
    if (photo) {
      setSelectedImage(photo);
      setShowOptions(false);
    }
  };

  const handleSelectFromGallery = async () => {
    const photo = await selectFromGallery();
    if (photo) {
      setSelectedImage(photo);
      setShowOptions(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedImage) return;

    // In a real app, you would upload to your server here
    // For now, we'll just use the local path
    const fileName = `profile_${Date.now()}.jpg`;
    onPhotoUpdate(selectedImage.webPath);
    setSelectedImage(null);
  };

  const handleCancelPhoto = () => {
    setSelectedImage(null);
  };

  const handleRemovePhoto = () => {
    onPhotoUpdate('');
    setSelectedImage(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Photo Display */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
          {selectedImage?.webPath || currentPhoto ? (
            <img
              src={selectedImage?.webPath || currentPhoto}
              alt={`${userName}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User size={32} className="text-gray-400" />
            </div>
          )}
        </div>

        {/* Photo Action Button */}
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={isLoading}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera size={16} />
          )}
        </button>
      </div>

      {/* Photo Selection Options */}
      {showOptions && (
        <div className="flex gap-2">
          <button
            onClick={handleTakePhoto}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded text-sm"
          >
            <Camera size={14} />
            Take Photo
          </button>
          
          <button
            onClick={handleSelectFromGallery}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded text-sm"
          >
            <Upload size={14} />
            From Gallery
          </button>
          
          {(currentPhoto || selectedImage) && (
            <button
              onClick={handleRemovePhoto}
              className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded text-sm"
            >
              <Trash2 size={14} />
              Remove
            </button>
          )}
        </div>
      )}

      {/* Photo Preview Actions */}
      {selectedImage && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSavePhoto}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-medium"
          >
            Save Photo
          </button>
          
          <button
            onClick={handleCancelPhoto}
            className="px-4 py-2 bg-gray-500 text-white rounded text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Instructions */}
      <p className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-xs">
        Tap the camera icon to update your profile photo. You can take a new photo or choose from your gallery.
      </p>
    </div>
  );
}