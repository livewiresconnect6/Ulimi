import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoryCard } from "@/components/StoryCard";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  UserPlus, UserCheck, BookOpen, Heart, Users, Calendar,
  Mail, Globe, PenTool, ArrowLeft, Bookmark, BookmarkPlus
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/translation";
import type { Story, User as AppUser } from "@shared/schema";

export default function Author() {
  const { authorId } = useParams<{ authorId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch author data
  const { data: author, isLoading: authorLoading } = useQuery<AppUser>({
    queryKey: [`/api/authors/${authorId}`],
    enabled: !!authorId,
  });

  // Fetch author's stories
  const { data: authorStories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: [`/api/authors/${authorId}/stories`],
    enabled: !!authorId,
  });

  // Query for follow status
  const { data: followData } = useQuery({
    queryKey: [`/api/users/${user?.id}/following/${authorId}/status`],
    enabled: !!user?.id && !!authorId,
  });

  // Query for like status
  const { data: likeData } = useQuery({
    queryKey: [`/api/authors/${authorId}/liked/${user?.id}`],
    enabled: !!user?.id && !!authorId,
  });

  // Query for favorite status
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/users/${user?.id}/author-favorites/${authorId}/status`],
    enabled: !!user?.id && !!authorId,
  });

  // Query for library status
  const { data: libraryData } = useQuery({
    queryKey: [`/api/users/${user?.id}/author-library/${authorId}/status`],
    enabled: !!user?.id && !!authorId,
  });

  const isFollowing = (followData as any)?.isFollowing || false;
  const isLiked = (likeData as any)?.isLiked || false;
  const isFavorited = (favoriteData as any)?.isFavorited || false;
  const isInLibrary = (libraryData as any)?.isInLibrary || false;

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !authorId) throw new Error("User not authenticated");
      
      if (isFollowing) {
        return apiRequest("DELETE", `/api/users/${user.id}/follow/${authorId}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/follow`, { authorId: parseInt(authorId) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/following/${authorId}/status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/following`] });
      toast({
        title: isFollowing ? "Unfollowed author" : "Following author",
        description: isFollowing 
          ? `You've unfollowed ${author?.displayName || author?.username}` 
          : `You're now following ${author?.displayName || author?.username}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !authorId) throw new Error("User not authenticated");
      
      if (isLiked) {
        return apiRequest("DELETE", `/api/authors/${authorId}/like`, { userId: user.id });
      } else {
        return apiRequest("POST", `/api/authors/${authorId}/like`, { userId: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/authors/${authorId}/liked/${user?.id}`] });
      toast({
        title: isLiked ? "Author unliked" : "Author liked",
        description: isLiked ? "Removed from your liked authors" : "Added to your liked authors",
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

  // Favorite/Unfavorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !authorId) throw new Error("User not authenticated");
      
      if (isFavorited) {
        return apiRequest("DELETE", `/api/users/${user.id}/author-favorites/${authorId}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/author-favorites`, { authorId: parseInt(authorId) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/author-favorites/${authorId}/status`] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Author removed from your favorites" : "Author added to your favorites",
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

  // Library add/remove mutation
  const libraryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !authorId) throw new Error("User not authenticated");
      
      if (isInLibrary) {
        return apiRequest("DELETE", `/api/users/${user.id}/author-library/${authorId}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/author-library`, { authorId: parseInt(authorId) });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/author-library/${authorId}/status`] });
      toast({
        title: isInLibrary ? "Removed from library" : "Added to library",
        description: isInLibrary ? "Author removed from your library" : "Author added to your library",
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

  const handleFollow = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow authors",
        variant: "destructive",
      });
      return;
    }
    followMutation.mutate();
  };

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like authors",
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
        description: "Please sign in to favorite authors",
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
        description: "Please sign in to add authors to your library",
        variant: "destructive",
      });
      return;
    }
    libraryMutation.mutate();
  };

  if (authorLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-48"></div>
            <div className="bg-gray-200 rounded-xl h-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Author Not Found</h2>
              <p className="text-gray-600 mb-6">
                The author you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => setLocation("/")} className="bg-accent hover:bg-orange-600">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const publishedStories = authorStories?.filter(story => story.isPublished) || [];
  const totalReads = publishedStories.reduce((sum, story) => sum + (story.readCount || 0), 0);
  const totalLikes = publishedStories.reduce((sum, story) => sum + (story.likeCount || 0), 0);

  return (
    <div className="pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6 text-gray-600 hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Author Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={author.photoURL || undefined} />
                  <AvatarFallback className="bg-accent text-white text-3xl">
                    {author.displayName?.charAt(0) || author.username?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Author Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-primary">
                    {author.displayName || author.username}
                  </h1>
                  {user && user.id !== author.id && (
                    <div className="flex items-center gap-3">
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        onClick={handleFollow}
                        disabled={followMutation.isPending}
                        className={isFollowing ? 'border-accent text-accent hover:bg-accent hover:text-white' : 'bg-accent hover:bg-orange-600'}
                      >
                        {followMutation.isPending ? (
                          "..."
                        ) : isFollowing ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                      
                      {/* Secondary action buttons */}
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
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    {author.email}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Joined {new Date(author.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    {SUPPORTED_LANGUAGES.find(lang => lang.code === author.preferredLanguage)?.name || 'English'}
                  </div>
                </div>
                
                {author.bio && (
                  <p className="text-gray-700 mb-4">{author.bio}</p>
                )}

                {/* Author Tags */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-600">
                    <PenTool className="mr-1 h-3 w-3" />
                    Author
                  </Badge>
                  {author.preferredGenres?.map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{publishedStories.length}</div>
                <div className="text-sm text-gray-600">Published Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalReads.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Reads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalLikes.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Likes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Author's Stories */}
        <Tabs defaultValue="stories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="stories" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Stories ({publishedStories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories">
            {storiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
                ))}
              </div>
            ) : publishedStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    author={author}
                    onClick={() => setLocation(`/read/${story.id}`)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">No Published Stories</h3>
                  <p className="text-gray-600">
                    This author hasn't published any stories yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}