import React, { useState } from 'react';
import { Modal, Portal, Surface, Title, Text, Button, IconButton, ProgressBar } from 'react-native-paper';
import { View, Alert, StyleSheet, Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';

interface AudioUploadModalProps {
  visible: boolean;
  onDismiss: () => void;
  onAudioSelected: (audioUri: string, fileName: string, size: number) => void;
  title: string;
}

const AudioUploadModal: React.FC<AudioUploadModalProps> = ({
  visible,
  onDismiss,
  onAudioSelected,
  title,
}) => {
  const [selectedAudio, setSelectedAudio] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  
  // Audio upload limits based on typical mobile app constraints
  const MAX_AUDIO_SIZE_MB = 25; // 25MB max for mobile apps
  const MAX_DURATION_MINUTES = 30; // 30 minutes max duration
  const SUPPORTED_FORMATS = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectAudioFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.audio,
          'audio/mp3',
          'audio/wav', 
          'audio/m4a',
          'audio/aac',
          'audio/ogg'
        ],
      });

      if (result && result.length > 0) {
        const file = result[0];
        const fileSizeBytes = file.size || 0;
        const fileSizeMB = fileSizeBytes / (1024 * 1024);
        
        // Check file size
        if (fileSizeMB > MAX_AUDIO_SIZE_MB) {
          Alert.alert(
            'File Too Large',
            `Audio file is ${formatBytes(fileSizeBytes)}. Maximum allowed size is ${MAX_AUDIO_SIZE_MB}MB.`,
            [{ text: 'OK' }]
          );
          return;
        }

        // Check file format
        const fileExtension = file.name?.split('.').pop()?.toLowerCase();
        if (fileExtension && !SUPPORTED_FORMATS.includes(fileExtension)) {
          Alert.alert(
            'Unsupported Format',
            `File format '.${fileExtension}' is not supported. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`,
            [{ text: 'OK' }]
          );
          return;
        }

        setSelectedAudio({
          ...file,
          sizeFormatted: formatBytes(fileSizeBytes),
          sizeMB: fileSizeMB,
        });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to select audio file');
      }
    }
  };

  const handleSaveAudio = async () => {
    if (selectedAudio) {
      setUploading(true);
      try {
        // Here you would typically upload the audio file to your server
        // For now, we'll just pass the data back
        onAudioSelected(selectedAudio.uri, selectedAudio.name, selectedAudio.size);
        setSelectedAudio(null);
        onDismiss();
      } catch (error) {
        Alert.alert('Error', 'Failed to save audio file');
      } finally {
        setUploading(false);
      }
    }
  };

  const resetSelection = () => {
    setSelectedAudio(null);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Surface style={styles.surface}>
          <View style={styles.header}>
            <Title style={styles.title}>{title}</Title>
            <IconButton icon="close" onPress={onDismiss} />
          </View>

          <View style={styles.limits}>
            <Text style={styles.sizeWarning}>
              🎵 Audio Upload Limits
            </Text>
            <Text style={styles.limitText}>
              • Maximum file size: {MAX_AUDIO_SIZE_MB}MB
            </Text>
            <Text style={styles.limitText}>
              • Maximum duration: {MAX_DURATION_MINUTES} minutes
            </Text>
            <Text style={styles.limitText}>
              • Supported formats: {SUPPORTED_FORMATS.join(', ')}
            </Text>
            <Text style={styles.limitSubtext}>
              Higher quality audio files provide better listening experience but use more storage space.
            </Text>
          </View>

          {selectedAudio ? (
            <View style={styles.audioPreview}>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{selectedAudio.name}</Text>
                <Text style={styles.fileSize}>{selectedAudio.sizeFormatted}</Text>
                <Text style={styles.fileType}>
                  {selectedAudio.type || 'Audio file'}
                </Text>
              </View>

              {uploading && (
                <View style={styles.uploadProgress}>
                  <Text style={styles.uploadingText}>Uploading audio...</Text>
                  <ProgressBar indeterminate style={styles.progressBar} />
                </View>
              )}

              <View style={styles.previewActions}>
                <Button mode="outlined" onPress={resetSelection} style={styles.button}>
                  Choose Different
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveAudio}
                  loading={uploading}
                  disabled={uploading}
                  style={styles.button}
                >
                  Save Audio
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.uploadOptions}>
              <Button
                mode="contained"
                onPress={selectAudioFile}
                icon="file-music"
                style={styles.uploadButton}
              >
                Select Audio File
              </Button>
              
              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>💡 Tip for Parents:</Text>
                <Text style={styles.tipText}>
                  Record your own voice reading stories for a personal touch. 
                  Use your phone's voice recorder app, then select the file here.
                </Text>
              </View>
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
    maxHeight: '90%',
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
  limits: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sizeWarning: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  limitText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  limitSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  uploadOptions: {
    gap: 16,
  },
  uploadButton: {
    marginBottom: 8,
  },
  tipBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#1565c0',
  },
  audioPreview: {
    alignItems: 'center',
    gap: 16,
  },
  fileInfo: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  fileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  fileType: {
    fontSize: 12,
    color: '#999',
  },
  uploadProgress: {
    width: '100%',
    alignItems: 'center',
  },
  uploadingText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});

export default AudioUploadModal;