import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mic, Volume2, Heart, Share2 } from 'lucide-react';
import { ChapterNavigation } from './ChapterNavigation';
import { AudioRecorder } from './AudioRecorder';
import { useToast } from '@/hooks/use-toast';
import { Story, Chapter, User, AudioRecording } from '@shared/schema';

interface ChapterReaderProps {
  story: Story;
  user?: User;
}

export function ChapterReader({ story, user }: ChapterReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showAudioList, setShowAudioList] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch story chapters
  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/stories', story.id, 'chapters'],
    queryFn: async () => {
      const response = await fetch(`/api/stories/${story.id}/chapters`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      return response.json();
    },
  });

  // Fetch audio recordings for current chapter
  const currentChapterData = chapters.find(ch => ch.chapterNumber === currentChapter);
  const { data: audioRecordings = [] } = useQuery<AudioRecording[]>({
    queryKey: ['/api/chapters', currentChapterData?.id, 'audio-recordings'],
    queryFn: async () => {
      if (!currentChapterData) return [];
      const response = await fetch(`/api/chapters/${currentChapterData.id}/audio-recordings`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!currentChapterData,
  });

  // Create audio recording mutation
  const createRecordingMutation = useMutation({
    mutationFn: async (recordingData: {
      userId: number;
      storyId: number;
      chapterId: number;
      title: string;
      audioUrl: string;
      duration: number;
      fileSize: number;
      isPublic: boolean;
      isSubscriberOnly: boolean;
    }) => {
      const response = await fetch('/api/audio-recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordingData),
      });
      if (!response.ok) throw new Error('Failed to save recording');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chapters', currentChapterData?.id, 'audio-recordings'] 
      });
      setShowAudioRecorder(false);
      toast({
        title: "Recording saved!",
        description: "Your audio recording has been saved successfully.",
      });
    },
  });

  const handleChapterChange = (chapterNumber: number) => {
    setCurrentChapter(chapterNumber);
    setShowAudioRecorder(false);
    setShowAudioList(false);
  };

  const handleRecordingComplete = (audioUrl: string, duration: number, fileSize: number) => {
    if (!user || !currentChapterData) return;

    const recordingData = {
      userId: user.id,
      storyId: story.id,
      chapterId: currentChapterData.id,
      title: `${story.title} - ${currentChapterData.title}`,
      audioUrl,
      duration,
      fileSize,
      isPublic: true,
      isSubscriberOnly: false,
    };

    createRecordingMutation.mutate(recordingData);
  };

  const toggleAudioRecorder = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to record audio.",
        variant: "destructive",
      });
      return;
    }
    setShowAudioRecorder(!showAudioRecorder);
    setShowAudioList(false);
  };

  const toggleAudioList = () => {
    setShowAudioList(!showAudioList);
    setShowAudioRecorder(false);
  };

  if (chaptersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading chapters...</p>
        </div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">No chapters available for this story.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Chapter Navigation */}
      <ChapterNavigation
        chapters={chapters}
        currentChapter={currentChapter}
        storyTitle={story.title}
        onChapterChange={handleChapterChange}
        onToggleAudio={toggleAudioList}
        hasAudioRecordings={audioRecordings.length > 0}
      />

      {/* Audio Controls */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={toggleAudioRecorder}
          variant={showAudioRecorder ? "default" : "outline"}
          className="flex items-center space-x-2"
        >
          <Mic className="w-4 h-4" />
          <span>{showAudioRecorder ? 'Hide Recorder' : 'Record Audio'}</span>
        </Button>
        
        {audioRecordings.length > 0 && (
          <Button
            onClick={toggleAudioList}
            variant={showAudioList ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>{showAudioList ? 'Hide Audio' : `Audio (${audioRecordings.length})`}</span>
          </Button>
        )}
      </div>

      {/* Audio Recorder */}
      {showAudioRecorder && (
        <AudioRecorder
          storyId={story.id}
          chapterId={currentChapterData?.id}
          userId={user?.id || 0}
          onRecordingComplete={handleRecordingComplete}
        />
      )}

      {/* Audio Recordings List */}
      {showAudioList && audioRecordings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">
              Available Audio Recordings ({audioRecordings.length})
            </h3>
            <div className="space-y-3">
              {audioRecordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{recording.title}</p>
                    <p className="text-xs text-gray-600">
                      Duration: {Math.floor((recording.duration || 0) / 60)}:{((recording.duration || 0) % 60).toString().padStart(2, '0')} |{' '}
                      Likes: {recording.likeCount || 0}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Volume2 className="w-3 h-3 mr-1" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chapter Content */}
      {currentChapterData && (
        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentChapterData.title}
              </h2>
              
              <Separator className="my-4" />
              
              <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {currentChapterData.content}
              </div>
            </div>

            {/* Chapter Actions */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Chapter {currentChapter} of {chapters.length}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}