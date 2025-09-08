import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { StoryCard } from "@/components/StoryCard";
import { AuthorCard } from "@/components/AuthorCard";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { useLocation } from "wouter";
import { PenTool, Book, Users } from "lucide-react";
import type { Story, User } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: featuredStories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const { data: featuredAuthors, isLoading: authorsLoading } = useQuery<User[]>({
    queryKey: ["/api/featured-authors"],
  });

  if (storiesLoading || authorsLoading) {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-r from-primary to-blue-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="h-8 bg-white/20 rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-white/20 rounded mb-8 animate-pulse"></div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <div className="h-12 bg-white/20 rounded animate-pulse w-32"></div>
                <div className="h-12 bg-white/20 rounded animate-pulse w-32"></div>
              </div>
            </div>
          </div>
        </div>
        
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 bg-gray-200 rounded mb-8 animate-pulse w-48"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Discover Stories in Your Language</h2>
            <p className="text-xl mb-8 opacity-90">Read, write, and listen to stories with instant translation</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation("/write")}
                className="bg-accent hover:bg-orange-600 text-white"
              >
                <PenTool className="mr-2 h-5 w-5" />
                Start Writing
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/browse")}
                className="bg-white text-primary hover:bg-gray-100"
              >
                <Book className="mr-2 h-5 w-5" />
                Browse Stories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Authors */}
      {featuredAuthors && featuredAuthors.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <HorizontalScroller title="Featured Authors">
              {featuredAuthors.map((author) => (
                <AuthorCard
                  key={author.id}
                  author={author}
                  onClick={() => setLocation(`/author/${author.id}`)}
                />
              ))}
            </HorizontalScroller>
          </div>
        </section>
      )}

      {/* Featured Stories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HorizontalScroller title="Latest Stories">
            {featuredStories && featuredStories.length > 0 ? (
              featuredStories.map((story) => (
                <div key={story.id} className="min-w-[320px]">
                  <StoryCard
                    story={story}
                    onClick={() => setLocation(`/read/${story.id}`)}
                  />
                </div>
              ))
            ) : (
              <div className="min-w-[320px] text-center py-12">
                <p className="text-gray-500 mb-4">No featured stories available yet.</p>
                <Button onClick={() => setLocation("/write")} className="bg-accent hover:bg-orange-600">
                  <PenTool className="mr-2 h-4 w-4" />
                  Be the first to write a story
                </Button>
              </div>
            )}
          </HorizontalScroller>
        </div>
      </section>
    </div>
  );
}
