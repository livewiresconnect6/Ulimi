import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen, Headphones } from 'lucide-react';
import { Chapter } from '@shared/schema';

interface ChapterNavigationProps {
  chapters: Chapter[];
  currentChapter: number;
  storyTitle: string;
  onChapterChange: (chapterNumber: number) => void;
  onToggleAudio?: () => void;
  hasAudioRecordings?: boolean;
}

export function ChapterNavigation({ 
  chapters, 
  currentChapter, 
  storyTitle, 
  onChapterChange, 
  onToggleAudio,
  hasAudioRecordings = false 
}: ChapterNavigationProps) {
  const currentChapterData = chapters.find(ch => ch.chapterNumber === currentChapter);
  const canGoPrevious = currentChapter > 1;
  const canGoNext = currentChapter < chapters.length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">{storyTitle}</CardTitle>
          </div>
          {hasAudioRecordings && onToggleAudio && (
            <Button
              onClick={onToggleAudio}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Headphones className="w-4 h-4" />
              <span>Audio</span>
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chapter Info */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Chapter {currentChapter} of {chapters.length}
          </h3>
          {currentChapterData && (
            <p className="text-sm text-gray-600 font-medium">
              {currentChapterData.title}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentChapter / chapters.length) * 100}%` }}
          />
        </div>

        {/* Chapter Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => onChapterChange(currentChapter - 1)}
            disabled={!canGoPrevious}
            variant={canGoPrevious ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {/* Chapter Selector */}
          <div className="flex space-x-1">
            {chapters.map((chapter) => (
              <Button
                key={chapter.id}
                onClick={() => onChapterChange(chapter.chapterNumber)}
                variant={chapter.chapterNumber === currentChapter ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0 text-xs"
              >
                {chapter.chapterNumber}
              </Button>
            ))}
          </div>

          <Button
            onClick={() => onChapterChange(currentChapter + 1)}
            disabled={!canGoNext}
            variant={canGoNext ? "default" : "outline"}
            size="sm"
            className="flex items-center space-x-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Chapter List (Mobile-friendly) */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onChapterChange(chapter.chapterNumber)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                chapter.chapterNumber === currentChapter
                  ? 'bg-purple-100 border border-purple-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-sm font-medium">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </div>
              {chapter.chapterNumber === currentChapter && (
                <div className="text-xs text-purple-600 mt-1">
                  Currently reading
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}