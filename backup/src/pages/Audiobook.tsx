import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioControls } from "@/components/AudioControls";
import { useAudio } from "@/hooks/useAudio";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Eye, Heart, Bookmark, BookmarkPlus } from "lucide-react";
import { useLocation } from "wouter";
import type { Story, Chapter } from "@shared/schema";
import type { LanguageCode } from "@/lib/translation";

export default function Audiobook() {
  const [, params] = useRoute("/audiobook/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { audioState, loadText, loadCustomAudio, togglePlayPause, setPlaybackRate, seekTo, rewind, forward } = useAudio();
  const { currentLanguage, isTranslating, translateStoryContent, changeLanguage } = useTranslation();
  const [showText, setShowText] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentContent, setCurrentContent] = useState("");

  const storyId = params?.id ? parseInt(params.id) : null;

  const { data: story, isLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
    enabled: !!storyId,
  });

  const { data: chapters } = useQuery<Chapter[]>({
    queryKey: [`/api/stories/${storyId}/chapters`],
    enabled: !!storyId,
  });

  // Query for story interaction status
  const { data: likeData } = useQuery({
    queryKey: [`/api/stories/${storyId}/liked/${user?.id}`],
    enabled: !!user?.id && !!storyId,
  });

  const { data: favoriteData } = useQuery({
    queryKey: [`/api/users/${user?.id}/favorites/${storyId}/status`],
    enabled: !!user?.id && !!storyId,
  });

  const { data: libraryData } = useQuery({
    queryKey: [`/api/users/${user?.id}/library/${storyId}/status`],
    enabled: !!user?.id && !!storyId,
  });

  const isLiked = (likeData as any)?.isLiked || false;
  const isFavorited = (favoriteData as any)?.isFavorited || false;
  const isInLibrary = (libraryData as any)?.isInLibrary || false;

  const currentChapterData = chapters?.find(ch => ch.chapterNumber === currentChapter) || null;
  const totalChapters = chapters?.length || 1;

  // Story interaction mutations
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !storyId) throw new Error("User not authenticated");
      
      if (isLiked) {
        return apiRequest("DELETE", `/api/stories/${storyId}/like`, { userId: user.id });
      } else {
        return apiRequest("POST", `/api/stories/${storyId}/like`, { userId: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${storyId}/liked/${user?.id}`] });
      toast({
        title: isLiked ? "Story unliked" : "Story liked",
        description: isLiked ? "Removed from your liked stories" : "Added to your liked stories",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !storyId) throw new Error("User not authenticated");
      
      if (isFavorited) {
        return apiRequest("DELETE", `/api/users/${user.id}/favorites/${storyId}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/favorites`, { storyId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/favorites/${storyId}/status`] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Story removed from your favorites" : "Story added to your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    },
  });

  const libraryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !storyId) throw new Error("User not authenticated");
      
      if (isInLibrary) {
        return apiRequest("DELETE", `/api/users/${user.id}/library/${storyId}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/library`, { storyId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/library/${storyId}/status`] });
      toast({
        title: isInLibrary ? "Removed from library" : "Added to library",
        description: isInLibrary ? "Story removed from your library" : "Story added to your library",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update library status",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like stories",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleFavorite = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to favorite stories",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  const handleLibrary = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add stories to your library",
        variant: "destructive",
      });
      return;
    }
    libraryMutation.mutate();
  };

  // Load and translate content when story, chapter, or language changes
  useEffect(() => {
    if (!story) return;

    const contentToLoad = currentChapterData?.content || story.content;
    
    if (currentLanguage === 'en') {
      setCurrentContent(contentToLoad);
      loadText(contentToLoad, currentLanguage);
    } else {
      translateStoryContent(
        contentToLoad,
        currentLanguage,
        story.id,
        currentChapterData?.id
      ).then((translated) => {
        setCurrentContent(translated);
        loadText(translated, currentLanguage);
      }).catch(console.error);
    }
  }, [story, currentChapterData, currentLanguage, translateStoryContent, loadText]);

  const handleLanguageChange = (language: LanguageCode) => {
    changeLanguage(language);
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < totalChapters) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="h-32 bg-gray-200 rounded-lg mb-6 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded mb-2 animate-pulse w-64 mx-auto"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
              </div>
              <div className="space-y-6">
                <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex justify-center space-x-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Story Not Found</h2>
              <p className="text-gray-600 mb-6">The story you're looking for doesn't exist.</p>
              <Button onClick={() => setLocation("/")} className="bg-accent hover:bg-orange-600">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation(`/read/${storyId}`)}
            className="flex items-center text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reading
          </Button>
          
          <div className="flex items-center space-x-4">
            {user && user.id !== story.authorId && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className={`flex items-center ${isFavorited ? 'text-orange-500' : 'text-gray-500'}`}
                >
                  <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLibrary}
                  disabled={libraryMutation.isPending}
                  className={`flex items-center ${isInLibrary ? 'text-blue-500' : 'text-gray-500'}`}
                >
                  <BookmarkPlus className={`h-4 w-4 ${isInLibrary ? 'fill-current' : ''}`} />
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowText(!showText)}
              className="flex items-center"
            >
              <Eye className="mr-2 h-4 w-4" />
              {showText ? "Hide Text" : "Show Text"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Audio Player Header */}
            <div className="text-center mb-8">
              {/* Audio Visualization Placeholder */}
              <div className="w-full h-32 bg-gradient-to-r from-accent/20 to-orange-600/20 rounded-lg mb-6 flex items-center justify-center">
                <div className="flex space-x-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-accent rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 40 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-primary mb-2">{story.title}</h2>
              <p className="text-gray-600">
                {currentChapterData ? `Chapter ${currentChapter}: ${currentChapterData.title}` : 'Full Story'}
              </p>
              {totalChapters > 1 && (
                <p className="text-sm text-gray-500 mt-1">
                  Chapter {currentChapter} of {totalChapters}
                </p>
              )}
            </div>
            
            {/* Audio Controls */}
            <AudioControls
              audioState={audioState}
              currentLanguage={currentLanguage}
              onPlayPause={togglePlayPause}
              onSeek={seekTo}
              onRewind={() => rewind(15)}
              onForward={() => forward(15)}
              onSpeedChange={setPlaybackRate}
              onLanguageChange={handleLanguageChange}
              onPreviousChapter={totalChapters > 1 ? goToPreviousChapter : undefined}
              onNextChapter={totalChapters > 1 ? goToNextChapter : undefined}
              onAudioUpload={loadCustomAudio}
            />
            
            {/* Text Following Mode */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Follow Along</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowText(!showText)}
                  className="flex items-center"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showText ? "Hide Text" : "Show Text"}
                </Button>
              </div>
              
              {showText && (
                <div className="bg-gray-50 rounded-lg p-6">
                  {isTranslating ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">Translating content...</span>
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none leading-relaxed">
                      <div className="whitespace-pre-wrap text-lg leading-8">
                        {currentContent}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
