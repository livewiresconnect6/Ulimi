import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, UserCheck, BookOpen, Users, Heart, Bookmark, BookmarkPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthorCardProps {
  author: User;
  onClick?: () => void;
  showActions?: boolean;
}

export function AuthorCard({ author, onClick, showActions = true }: AuthorCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Query for follow status
  const { data: followData } = useQuery({
    queryKey: [`/api/users/${user?.id}/following/${author.id}/status`],
    enabled: !!user?.id && showActions && user?.id !== author.id,
  });

  // Query for author stats
  const { data: authorStats } = useQuery({
    queryKey: [`/api/authors/${author.id}/stats`],
    enabled: showActions,
  });

  // Query for author like status
  const { data: likeData } = useQuery({
    queryKey: [`/api/authors/${author.id}/liked/${user?.id}`],
    enabled: !!user?.id && showActions && user?.id !== author.id,
  });

  // Query for author favorite status
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/users/${user?.id}/author-favorites/${author.id}/status`],
    enabled: !!user?.id && showActions && user?.id !== author.id,
  });

  // Query for author library status
  const { data: libraryData } = useQuery({
    queryKey: [`/api/users/${user?.id}/author-library/${author.id}/status`],
    enabled: !!user?.id && showActions && user?.id !== author.id,
  });

  const isFollowing = (followData as any)?.isFollowing || false;
  const isLiked = (likeData as any)?.isLiked || false;
  const isFavorited = (favoriteData as any)?.isFavorited || false;
  const isInLibrary = (libraryData as any)?.isInLibrary || false;

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isFollowing) {
        return apiRequest("DELETE", `/api/users/${user.id}/following/${author.id}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/following`, { authorId: author.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/following/${author.id}/status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/following`] });
      queryClient.invalidateQueries({ queryKey: [`/api/authors/${author.id}/stats`] });
      toast({
        title: isFollowing ? "Unfollowed author" : "Following author",
        description: isFollowing ? `You unfollowed ${author.displayName || author.username}` : `You are now following ${author.displayName || author.username}`,
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
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isLiked) {
        return apiRequest("DELETE", `/api/authors/${author.id}/like`, { userId: user.id });
      } else {
        return apiRequest("POST", `/api/authors/${author.id}/like`, { userId: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/authors/${author.id}/liked/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/authors/${author.id}/stats`] });
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
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isFavorited) {
        return apiRequest("DELETE", `/api/users/${user.id}/author-favorites/${author.id}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/author-favorites`, { authorId: author.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/author-favorites/${author.id}/status`] });
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
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isInLibrary) {
        return apiRequest("DELETE", `/api/users/${user.id}/author-library/${author.id}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/author-library`, { authorId: author.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/author-library/${author.id}/status`] });
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

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCardClick = () => {
    if (!isProcessing) {
      onClick?.();
    }
  };

  const stats = authorStats as any;
  const storiesCount = stats?.storiesCount || 0;
  const followersCount = stats?.followersCount || 0;

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer relative min-w-[280px]"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage src={author.photoURL || undefined} />
            <AvatarFallback className="text-lg">
              {author.displayName?.charAt(0) || author.username?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          
          <h4 className="text-xl font-semibold text-primary mb-2">
            {author.displayName || author.username}
          </h4>
          
          {author.bio && (
            <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
              {author.bio}
            </p>
          )}
          
          <div className="flex items-center justify-center gap-6 mb-4 w-full">
            <div className="flex items-center text-gray-500">
              <BookOpen className="h-4 w-4 mr-1" />
              <span className="text-sm">{storiesCount} stories</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{followersCount} followers</span>
            </div>
          </div>

          {/* Action buttons */}
          {showActions && user && user.id !== author.id && (
            <>
              {/* Follow button */}
              <Button
                onClick={handleFollow}
                disabled={followMutation.isPending}
                className={`w-full mb-3 ${
                  isFollowing 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-primary hover:bg-primary/90 text-white'
                }`}
                variant={isFollowing ? "outline" : "default"}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>

              {/* Secondary action buttons */}
              <div className="flex items-center justify-between w-full gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">Like</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className={`flex items-center ${isFavorited ? 'text-orange-500' : 'text-gray-500'}`}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
                  <span className="text-sm">{isFavorited ? 'Saved' : 'Save'}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLibrary}
                  disabled={libraryMutation.isPending}
                  className={`flex items-center ${isInLibrary ? 'text-blue-500' : 'text-gray-500'}`}
                >
                  <BookmarkPlus className={`h-4 w-4 mr-1 ${isInLibrary ? 'fill-current' : ''}`} />
                  <span className="text-sm">{isInLibrary ? 'Added' : 'Add'}</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}