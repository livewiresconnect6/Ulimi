import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { ChapterReader } from "@/components/ChapterReader";
import type { Story } from "@shared/schema";

export default function Read() {
  const [, params] = useRoute("/read/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const storyId = params?.id ? parseInt(params.id) : null;

  const { data: story, isLoading: storyLoading } = useQuery<Story>({
    queryKey: [`/api/stories/${storyId}`],
    enabled: !!storyId,
  });

  if (storyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Story not found</p>
          <Button 
            onClick={() => setLocation('/')} 
            variant="outline" 
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              onClick={() => setLocation('/')} 
              variant="ghost" 
              size="sm"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {story.title}
              </h1>
              <p className="text-sm text-gray-600">
                Reading Mode with Audio Recording
              </p>
            </div>

            <Button
              onClick={() => setLocation(`/audiobook/${story.id}`)}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M8 21l3-3h4a1 1 0 001-1V7a1 1 0 00-1-1h-4l-3-3v18z" />
              </svg>
              Audio Mode
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter Reader with Audio Recording */}
      <div className="py-6">
        <ChapterReader story={story} user={user || undefined} />
      </div>
    </div>
  );
}