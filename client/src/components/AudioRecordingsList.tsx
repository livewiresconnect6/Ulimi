import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Lock, Heart, HeartIcon } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { SubscriptionButton } from './SubscriptionButton';
import type { AudioRecording, User } from '@shared/schema';

interface AudioRecording extends AudioRecording {
  user?: User;
}

interface AudioRecordingsListProps {
  storyId?: number;
  chapterId?: number;
  authorId?: number;
  currentUserId: number;
  isUserSubscribed?: boolean;
}

export function AudioRecordingsList({ 
  storyId, 
  chapterId, 
  authorId, 
  currentUserId, 
  isUserSubscribed = false 
}: AudioRecordingsListProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const { audioState, loadCustomAudio, togglePlayPause, stop } = useAudio();

  // Build query URL based on provided filters
  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    if (storyId) params.append('storyId', storyId.toString());
    if (chapterId) params.append('chapterId', chapterId.toString());
    if (authorId) params.append('authorId', authorId.toString());
    return `/api/audio-recordings?${params.toString()}`;
  };

  const { data: recordings, isLoading } = useQuery<AudioRecording[]>({
    queryKey: [buildQueryUrl()],
  });

  const handlePlayRecording = async (recording: AudioRecording) => {
    if (currentlyPlaying === recording.id && audioState.isPlaying) {
      togglePlayPause();
      return;
    }

    if (currentlyPlaying !== recording.id) {
      stop();
      try {
        // For subscriber-only recordings, check access
        if (recording.isSubscriberOnly && !isUserSubscribed && recording.userId !== currentUserId) {
          return; // Should be handled by UI
        }

        // Load audio from URL
        const response = await fetch(recording.audioUrl);
        const blob = await response.blob();
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        
        await loadCustomAudio(file);
        setCurrentlyPlaying(recording.id);
      } catch (error) {
        console.error('Error loading audio:', error);
      }
    }

    togglePlayPause();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!recordings || recordings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No audio recordings available yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Authors can record their own narrations for stories and chapters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Audio Recordings</h3>
        {authorId && authorId !== currentUserId && (
          <SubscriptionButton 
            authorId={authorId} 
            currentUserId={currentUserId}
            variant="outline"
            size="sm"
            showSubscriberCount={true}
          />
        )}
      </div>

      {recordings.map((recording) => {
        const isLocked = recording.isSubscriberOnly && !isUserSubscribed && recording.userId !== currentUserId;
        const isCurrentlyPlaying = currentlyPlaying === recording.id && audioState.isPlaying;

        return (
          <Card key={recording.id} className={`${isLocked ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {recording.title}
                    {recording.isSubscriberOnly && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="w-3 h-3 mr-1" />
                        Subscribers Only
                      </Badge>
                    )}
                  </CardTitle>
                  {recording.user && (
                    <p className="text-sm text-muted-foreground mt-1">
                      by {recording.user.displayName || recording.user.username}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div>{formatDuration(recording.duration || 0)}</div>
                  <div>{recording.playCount || 0} plays</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => handlePlayRecording(recording)}
                  disabled={isLocked}
                  variant={isCurrentlyPlaying ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isCurrentlyPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isLocked ? 'Locked' : isCurrentlyPlaying ? 'Pause' : 'Play'}
                </Button>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    {recording.likeCount || 0}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(recording.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {isLocked && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Subscribe to this author to unlock their audio recordings</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}