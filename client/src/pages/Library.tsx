import { useQuery } from "@tanstack/react-query";
import { StoryCard } from "@/components/StoryCard";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PlusCircle } from "lucide-react";
import type { Story } from "@shared/schema";

export default function Library() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: libraryStories, isLoading } = useQuery<Story[]>({
    queryKey: [`/api/users/${user?.id}/library`],
    enabled: isAuthenticated && !!user?.id,
  });

  if (!isAuthenticated) {
    return (
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-4">Sign In to View Your Library</h2>
              <p className="text-gray-600 mb-6">
                Your personal library keeps track of stories you've saved for later reading.
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

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-200 rounded mb-8 animate-pulse w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">My Library</h1>
          <Button 
            onClick={() => setLocation("/browse")} 
            className="bg-accent hover:bg-orange-600"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Stories
          </Button>
        </div>

        {libraryStories && libraryStories.length > 0 ? (
          <>
            <p className="text-gray-600 mb-8">
              You have {libraryStories.length} {libraryStories.length === 1 ? 'story' : 'stories'} in your library.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libraryStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onClick={() => setLocation(`/read/${story.id}`)}
                />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-primary mb-4">Your Library is Empty</h2>
              <p className="text-gray-600 mb-6">
                Start building your personal library by saving stories you want to read later.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setLocation("/browse")} 
                  className="bg-accent hover:bg-orange-600"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Browse Stories
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/")}
                >
                  View Featured Stories
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
