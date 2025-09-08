import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, BookmarkPlus, Headphones, Eye, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Story, User } from "@shared/schema";

interface StoryCardProps {
  story: Story;
  author?: User;
  onClick?: () => void;
  showActions?: boolean;
}

export function StoryCard({ story, author, onClick, showActions = true }: StoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  // Query for like status
  const { data: likeData } = useQuery({
    queryKey: [`/api/stories/${story.id}/liked/${user?.id}`],
    enabled: !!user?.id && showActions,
  });

  // Query for favorite status
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/users/${user?.id}/favorites/${story.id}/status`],
    enabled: !!user?.id && showActions,
  });

  // Query for library status
  const { data: libraryData } = useQuery({
    queryKey: [`/api/users/${user?.id}/library/${story.id}/status`],
    enabled: !!user?.id && showActions,
  });

  const isLiked = (likeData as any)?.isLiked || false;
  const isFavorited = (favoriteData as any)?.isFavorited || false;
  const isInLibrary = (libraryData as any)?.isInLibrary || false;

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isLiked) {
        return apiRequest("DELETE", `/api/stories/${story.id}/like`, { userId: user.id });
      } else {
        return apiRequest("POST", `/api/stories/${story.id}/like`, { userId: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stories/${story.id}/liked/${user?.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
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

  // Favorite/Unfavorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isFavorited) {
        return apiRequest("DELETE", `/api/users/${user.id}/favorites/${story.id}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/favorites`, { storyId: story.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/favorites/${story.id}/status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/favorites`] });
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

  // Library add/remove mutation
  const libraryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      
      if (isInLibrary) {
        return apiRequest("DELETE", `/api/users/${user.id}/library/${story.id}`);
      } else {
        return apiRequest("POST", `/api/users/${user.id}/library`, { storyId: story.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/library/${story.id}/status`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/library`] });
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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCardClick = () => {
    if (!isProcessing) {
      onClick?.();
    }
  };

  const genreColors: Record<string, string> = {
    Fantasy: "bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700",
    Educational: "bg-gradient-to-br from-green-100 to-emerald-100 text-green-700",
    Children: "bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-700",
    Romance: "bg-gradient-to-br from-pink-100 to-rose-100 text-pink-700",
    Mystery: "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700",
    Drama: "bg-gradient-to-br from-red-100 to-pink-100 text-red-700",
    Adventure: "bg-gradient-to-br from-green-100 to-teal-100 text-green-700",
    Cultural: "bg-gradient-to-br from-amber-100 to-yellow-100 text-amber-700",
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 border-amber-200 hover:border-amber-300 touch-manipulation"
      onClick={handleCardClick}
      style={{ minWidth: "300px", maxWidth: "320px" }}
    >
      {/* Story cover preview or placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-amber-100 to-yellow-200">
        {story.coverImage ? (
          <img 
            src={story.coverImage} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-200 via-yellow-200 to-amber-300 flex items-center justify-center">
            <div className="text-center text-amber-700">
              <div className="text-4xl mb-2">📚</div>
              <div className="text-sm font-medium">{story.genre}</div>
              <div className="text-xs opacity-75">Classic Tale</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <CardContent className="p-6 bg-gradient-to-br from-amber-50/30 to-yellow-50/50">
        <div className="flex items-center justify-between mb-2">
          <Badge 
            variant="secondary" 
            className={genreColors[story.genre] || "bg-gray-100 text-gray-600"}
          >
            {story.genre}
          </Badge>
          <div className="flex items-center text-gray-500">
            <Headphones className="h-4 w-4 mr-1" />
            <span className="text-sm">Audio Available</span>
          </div>
        </div>
        
        <h4 className="text-xl font-semibold text-amber-800 mb-2 line-clamp-2">
          {story.title}
        </h4>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {story.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="w-8 h-8 mr-3">
              <AvatarImage src={author?.photoURL || undefined} />
              <AvatarFallback>
                {author?.displayName?.charAt(0) || author?.username?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">
              {author?.displayName || author?.username || 'Unknown Author'}
            </span>
          </div>
          
          <div className="flex items-center text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span className="text-sm">{story.readCount || 0}</span>
          </div>
        </div>

        {/* Action buttons */}
        {showActions && user && user.id !== story.authorId && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className={`flex items-center hover:scale-105 transition-transform ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{story.likeCount || 0}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavorite}
              disabled={favoriteMutation.isPending}
              className={`flex items-center hover:scale-105 transition-transform ${isFavorited ? 'text-orange-500' : 'text-gray-500'}`}
            >
              <Bookmark className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
              <span className="text-sm">{isFavorited ? 'Saved' : 'Save'}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLibrary}
              disabled={libraryMutation.isPending}
              className={`flex items-center hover:scale-105 transition-transform ${isInLibrary ? 'text-blue-500' : 'text-gray-500'}`}
            >
              <BookmarkPlus className={`h-4 w-4 mr-1 ${isInLibrary ? 'fill-current' : ''}`} />
              <span className="text-sm">{isInLibrary ? 'In Library' : 'Add'}</span>
            </Button>
          </div>
        )}
        
        {story.estimatedReadTime && (
          <div className="mt-2 text-sm text-gray-500">
            {story.estimatedReadTime} min read
          </div>
        )}
      </CardContent>
    </Card>
  );
}
