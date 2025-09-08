import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Headphones, ChevronLeft, ChevronRight, Heart, Bookmark, BookmarkPlus } from "lucide-react";
import { useLocation } from "wouter";
import type { Story, Chapter } from "@shared/schema";
import type { LanguageCode } from "@/lib/translation";

export default function Read() {
  const [, params] = useRoute("/read/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentLanguage, isTranslating, translateStoryContent, changeLanguage } = useTranslation();
  const [translatedContent, setTranslatedContent] = useState<string>("");
  const [currentChapter, setCurrentChapter] = useState(1);

  const storyId = params?.id ? parseInt(params.id) : null;

  const { data: story, isLoading: storyLoading } = useQuery<Story>({
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

  // Translate content when language or chapter changes
  useEffect(() => {
    if (story && currentChapterData) {
      const contentToTranslate = currentChapterData.content;
      
      if (currentLanguage === 'en') {
        setTranslatedContent(contentToTranslate);
      } else {
        translateStoryContent(
          contentToTranslate,
          currentLanguage,
          story.id,
          currentChapterData.id
        ).then(setTranslatedContent).catch(console.error);
      }
    } else if (story && !currentChapterData) {
      // Single chapter story
      if (currentLanguage === 'en') {
        setTranslatedContent(story.content);
      } else {
        translateStoryContent(
          story.content,
          currentLanguage,
          story.id
        ).then(setTranslatedContent).catch(console.error);
      }
    }
  }, [story, currentChapterData, currentLanguage, translateStoryContent]);

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

  const goToAudioMode = () => {
    setLocation(`/audiobook/${storyId}`);
  };

  if (storyLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-200 rounded mb-8 animate-pulse w-32"></div>
          <Card>
            <CardContent className="p-8">
              <div className="h-10 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded mb-8 animate-pulse w-3/4"></div>
              <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
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
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="flex items-center text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
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
            
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
              disabled={isTranslating}
            />
            
            <Button
              onClick={goToAudioMode}
              className="bg-accent hover:bg-orange-600 text-white"
            >
              <Headphones className="mr-2 h-4 w-4" />
              Audio Mode
            </Button>
          </div>
        </div>

        {/* Story Content */}
        <Card>
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-primary mb-4">{story.title}</h1>
            
            <div className="text-gray-600 mb-8 flex items-center space-x-4 flex-wrap">
              <span>By {story.authorId}</span>
              <span>•</span>
              <span>{story.estimatedReadTime} min read</span>
              <span>•</span>
              <span className="capitalize">{story.language}</span>
              {totalChapters > 1 && (
                <>
                  <span>•</span>
                  <span>Chapter {currentChapter} of {totalChapters}</span>
                </>
              )}
            </div>

            {/* Chapter Title for multi-chapter stories */}
            {currentChapterData && (
              <h2 className="text-xl font-semibold text-primary mb-6">
                {currentChapterData.title}
              </h2>
            )}
            
            {/* Story Content */}
            <div className="prose prose-lg max-w-none leading-relaxed">
              {isTranslating ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Translating content...</span>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-lg leading-8">
                  {translatedContent || story.content}
                </div>
              )}
            </div>
            
            {/* Chapter Navigation */}
            {totalChapters > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={goToPreviousChapter}
                    disabled={currentChapter <= 1}
                    className="flex items-center"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous Chapter
                  </Button>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Chapter {currentChapter} of {totalChapters}</span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all" 
                        style={{ width: `${(currentChapter / totalChapters) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={goToNextChapter}
                    disabled={currentChapter >= totalChapters}
                    className="flex items-center"
                  >
                    Next Chapter
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
