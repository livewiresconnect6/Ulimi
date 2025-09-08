import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoryCard } from "@/components/StoryCard";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { useLocation } from "wouter";
import { Search, Filter } from "lucide-react";
import type { Story } from "@shared/schema";

export default function Browse() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popular");

  const { data: stories, isLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories", { search: searchQuery }],
    enabled: true,
  });

  const filteredStories = stories?.filter(story => {
    if (genreFilter !== "all" && story.genre !== genreFilter) {
      return false;
    }
    return true;
  }) || [];

  const sortedStories = [...filteredStories].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.readCount || 0) - (a.readCount || 0);
      case "recent":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query key change
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-8 bg-gray-200 rounded mb-6 animate-pulse w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
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
        <h1 className="text-3xl font-bold text-primary mb-8">Browse Stories</h1>
        
        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Search stories by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
            <Button type="submit" className="bg-accent hover:bg-orange-600">
              Search
            </Button>
          </form>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="Fantasy">Fantasy</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Children">Children</SelectItem>
                  <SelectItem value="Romance">Romance</SelectItem>
                  <SelectItem value="Mystery">Mystery</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Stories Horizontal Scroll */}
        {sortedStories.length > 0 ? (
          <HorizontalScroller title={`${sortedStories.length} Stories Found`}>
            {sortedStories.map((story) => (
              <div key={story.id} className="min-w-[320px]">
                <StoryCard
                  story={story}
                  onClick={() => setLocation(`/read/${story.id}`)}
                />
              </div>
            ))}
          </HorizontalScroller>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchQuery ? "No stories found matching your search." : "No stories available yet."}
            </p>
            <Button 
              onClick={() => setLocation("/write")} 
              className="bg-accent hover:bg-orange-600"
            >
              Write the first story
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
