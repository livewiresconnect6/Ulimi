import React, { useState } from 'react';
import { Modal, Portal, Surface, Title, Text, Button, IconButton } from 'react-native-paper';
import { View, Image, Alert, Platform, StyleSheet } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { Camera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';

interface ImageUploadModalProps {
  visible: boolean;
  onDismiss: () => void;
  onImageSelected: (imageUri: string) => void;
  title: string;
  maxSizeMB?: number;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  visible,
  onDismiss,
  onImageSelected,
  title,
  maxSizeMB = 2,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  const checkImageSize = (imageUri: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // For React Native, we'll estimate size based on image dimensions
      // In a real app, you'd get the actual file size
      Image.getSize(imageUri, (width, height) => {
        // Rough estimate: 4 bytes per pixel for RGBA
        const estimatedSizeBytes = width * height * 4;
        const estimatedSizeMB = estimatedSizeBytes / (1024 * 1024);
        setImageSize(estimatedSizeMB);
        
        if (estimatedSizeMB > maxSizeMB) {
          Alert.alert(
            'Image Too Large',
            `Image size is approximately ${estimatedSizeMB.toFixed(1)}MB. Please select an image smaller than ${maxSizeMB}MB.`,
            [{ text: 'OK' }]
          );
          resolve(false);
        } else {
          resolve(true);
        }
      }, (error) => {
        console.error('Error getting image size:', error);
        resolve(true); // Allow upload if we can't determine size
      });
    });
  };

  const selectFromGallery = async () => {
    try {
      if (Platform.OS === 'web' || Platform.OS === 'android') {
        // Use Capacitor Camera for web and Android
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
        });
        
        if (image.webPath) {
          const isValidSize = await checkImageSize(image.webPath);
          if (isValidSize) {
            setSelectedImage(image.webPath);
          }
        }
      } else {
        // Use react-native-image-picker for iOS
        launchImageLibrary(
          {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
          },
          (response: ImagePickerResponse) => {
            if (response.assets && response.assets[0]) {
              const imageUri = response.assets[0].uri;
              if (imageUri) {
                checkImageSize(imageUri).then((isValid) => {
                  if (isValid) {
                    setSelectedImage(imageUri);
                  }
                });
              }
            }
          }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image from gallery');
    }
  };

  const takePicture = async () => {
    try {
      if (Platform.OS === 'web' || Platform.OS === 'android') {
        // Use Capacitor Camera for web and Android
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
        });
        
        if (image.webPath) {
          const isValidSize = await checkImageSize(image.webPath);
          if (isValidSize) {
            setSelectedImage(image.webPath);
          }
        }
      } else {
        // Use react-native-image-picker for iOS
        launchCamera(
          {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
          },
          (response: ImagePickerResponse) => {
            if (response.assets && response.assets[0]) {
              const imageUri = response.assets[0].uri;
              if (imageUri) {
                checkImageSize(imageUri).then((isValid) => {
                  if (isValid) {
                    setSelectedImage(imageUri);
                  }
                });
              }
            }
          }
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handleSaveImage = async () => {
    if (selectedImage) {
      setUploading(true);
      try {
        // Here you would typically upload the image to your server
        // For now, we'll just pass the URI back
        onImageSelected(selectedImage);
        setSelectedImage(null);
        onDismiss();
      } catch (error) {
        Alert.alert('Error', 'Failed to save image');
      } finally {
        setUploading(false);
      }
    }
  };

  const resetSelection = () => {
    setSelectedImage(null);
    setImageSize(0);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Title style={styles.title}>{title}</Title>
            <IconButton icon="close" onPress={onDismiss} />
          </View>

          <Text style={styles.sizeWarning}>
            📸 Maximum image size: {maxSizeMB}MB
          </Text>
          <Text style={styles.sizeSubtext}>
            Images larger than {maxSizeMB}MB will be rejected. Please choose photos wisely.
          </Text>

          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <Text style={styles.imageSizeText}>
                Estimated size: {imageSize.toFixed(1)}MB
              </Text>
              <View style={styles.previewActions}>
                <Button mode="outlined" onPress={resetSelection} style={styles.button}>
                  Choose Different
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveImage}
                  loading={uploading}
                  style={styles.button}
                >
                  Save Image
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <Button
                mode="contained"
                onPress={selectFromGallery}
                icon="image"
                style={styles.uploadButton}
              >
                Choose from Gallery
              </Button>
              <Button
                mode="outlined"
                onPress={takePicture}
                icon="camera"
                style={styles.uploadButton}
              >
                Take Picture
              </Button>
            </View>
          )}
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  surface: {
    padding: 20,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sizeWarning: {
    fontSize: 16,
    color: '#f57c00',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  sizeSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  uploadOptions: {
    gap: 12,
  },
  uploadButton: {
    marginBottom: 8,
  },
  imagePreview: {
    alignItems: 'center',
    gap: 12,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageSizeText: {
    fontSize: 14,
    color: '#666',
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default ImageUploadModal;