import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecorderProps {
  storyId?: number;
  chapterId?: number;
  userId: number;
  title?: string;
  onRecordingComplete?: (audioUrl: string, duration: number, fileSize: number) => void;
}

export function AudioRecorder({ storyId, chapterId, userId, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setFileSize(audioBlob.size);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      });

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setDuration(recordingTime);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      toast({
        title: "Recording stopped",
        description: "Your recording is ready to preview",
      });
    }
  }, [isRecording, recordingTime, toast]);

  const playRecording = useCallback(() => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [audioUrl, isPlaying]);

  const uploadRecording = useCallback(async () => {
    if (!audioUrl) return;

    setIsUploading(true);
    try {
      // Convert blob URL back to blob
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Get presigned URL for upload
      const uploadResponse = await fetch('/api/audio-recordings/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      
      const { uploadURL } = await uploadResponse.json();
      
      // Upload to object storage
      const uploadResult = await fetch(uploadURL, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'audio/wav'
        }
      });
      
      if (!uploadResult.ok) {
        throw new Error('Failed to upload audio file');
      }
      
      // Save recording metadata
      const metadataResponse = await fetch('/api/audio-recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: `Recording ${new Date().toLocaleString()}`,
          audioUrl: uploadURL.split('?')[0], // Remove query parameters
          duration,
          fileSize,
          storyId,
          chapterId,
          isSubscriberOnly: true // Default to subscriber-only
        })
      });
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to save recording metadata');
      }
      
      const savedRecording = await metadataResponse.json();
      
      // Notify parent component
      if (onRecordingComplete) {
        onRecordingComplete(savedRecording.audioUrl, duration, fileSize);
      }

      toast({
        title: "Recording uploaded",
        description: "Your audio recording has been saved successfully",
      });

      // Reset state
      setAudioUrl(null);
      setDuration(0);
      setFileSize(0);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error uploading recording:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload your recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [audioUrl, duration, fileSize, onRecordingComplete, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Status */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Audio Recorder</h3>
            {isRecording && (
              <div className="text-red-500 font-medium animate-pulse">
                Recording: {formatTime(recordingTime)}
              </div>
            )}
          </div>

          {/* Recording Controls */}
          <div className="flex space-x-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16"
              >
                <Mic className="w-8 h-8" />
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="rounded-full w-16 h-16"
              >
                <Square className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Playback Controls */}
          {audioUrl && (
            <>
              <audio
                ref={audioRef}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => {
                  const audio = e.target as HTMLAudioElement;
                  if (duration === 0) {
                    setDuration(Math.floor(audio.duration));
                  }
                }}
              >
                <source src={audioUrl} type="audio/wav" />
              </audio>
              
              <div className="w-full space-y-3">
                <div className="text-center text-sm text-gray-600">
                  Duration: {formatTime(duration)} | Size: {formatFileSize(fileSize)}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={playRecording}
                    variant="outline"
                    className="flex-1"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <Button
                    onClick={uploadRecording}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : 'Save'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Instructions */}
          {!audioUrl && !isRecording && (
            <div className="text-center text-sm text-gray-500 max-w-xs">
              Click the microphone to start recording your narration of this chapter
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}