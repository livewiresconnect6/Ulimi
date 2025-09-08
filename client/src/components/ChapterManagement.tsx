import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, BookOpen, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { Chapter } from '@shared/schema';

interface ChapterManagementProps {
  storyId: number;
  authorId: number;
  currentUserId: number;
  onChapterSelect?: (chapter: Chapter) => void;
}

interface ChapterFormData {
  title: string;
  content: string;
  chapterNumber: number;
}

export function ChapterManagement({ 
  storyId, 
  authorId, 
  currentUserId, 
  onChapterSelect 
}: ChapterManagementProps) {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterForm, setChapterForm] = useState<ChapterFormData>({
    title: '',
    content: '',
    chapterNumber: 1
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: chapters, isLoading } = useQuery<Chapter[]>({
    queryKey: ['/api/chapters', storyId],
  });

  const createChapterMutation = useMutation({
    mutationFn: async (chapterData: ChapterFormData) => {
      return await apiRequest('POST', '/api/chapters', {
        ...chapterData,
        storyId,
        wordCount: chapterData.content.split(' ').length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', storyId] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories', storyId] });
      setIsAddingChapter(false);
      setChapterForm({ title: '', content: '', chapterNumber: 1 });
      toast({
        title: "Chapter created",
        description: "Your new chapter has been added to the story",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create chapter",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateChapterMutation = useMutation({
    mutationFn: async (chapterData: ChapterFormData & { id: number }) => {
      return await apiRequest('PATCH', `/api/chapters/${chapterData.id}`, {
        title: chapterData.title,
        content: chapterData.content,
        wordCount: chapterData.content.split(' ').length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', storyId] });
      setEditingChapter(null);
      setChapterForm({ title: '', content: '', chapterNumber: 1 });
      toast({
        title: "Chapter updated",
        description: "Your changes have been saved",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update chapter",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: async (chapterId: number) => {
      return await apiRequest('DELETE', `/api/chapters/${chapterId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', storyId] });
      queryClient.invalidateQueries({ queryKey: ['/api/stories', storyId] });
      toast({
        title: "Chapter deleted",
        description: "The chapter has been removed from the story",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete chapter",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitChapter = () => {
    if (!chapterForm.title.trim() || !chapterForm.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and content for the chapter",
        variant: "destructive",
      });
      return;
    }

    if (editingChapter) {
      updateChapterMutation.mutate({ ...chapterForm, id: editingChapter.id });
    } else {
      createChapterMutation.mutate(chapterForm);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      title: chapter.title,
      content: chapter.content,
      chapterNumber: chapter.chapterNumber
    });
    setIsAddingChapter(true);
  };

  const handleCancelEdit = () => {
    setIsAddingChapter(false);
    setEditingChapter(null);
    setChapterForm({ title: '', content: '', chapterNumber: 1 });
  };

  // Calculate next chapter number
  const nextChapterNumber = chapters ? Math.max(...chapters.map(c => c.chapterNumber), 0) + 1 : 1;

  const isAuthor = authorId === currentUserId;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Story Chapters
        </h3>
        {isAuthor && (
          <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                onClick={() => {
                  setChapterForm({ ...chapterForm, chapterNumber: nextChapterNumber });
                  setEditingChapter(null);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Chapter Title</label>
                    <Input
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                      placeholder="Enter chapter title..."
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-sm font-medium mb-2 block">Chapter #</label>
                    <Input
                      type="number"
                      min="1"
                      value={chapterForm.chapterNumber}
                      onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Chapter Content</label>
                  <Textarea
                    value={chapterForm.content}
                    onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                    placeholder="Write your chapter content here..."
                    className="min-h-[300px]"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Word count: {chapterForm.content.split(' ').filter(word => word.length > 0).length}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitChapter}
                    disabled={createChapterMutation.isPending || updateChapterMutation.isPending}
                  >
                    {editingChapter ? 'Update Chapter' : 'Create Chapter'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!chapters || chapters.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">This story doesn't have chapters yet.</p>
            {isAuthor && (
              <p className="text-sm text-muted-foreground">
                Add chapters to organize your story into readable sections.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {chapters.map((chapter, index) => (
            <Card key={chapter.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onChapterSelect?.(chapter)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        Chapter {chapter.chapterNumber}
                      </Badge>
                      <h4 className="font-medium text-lg">{chapter.title}</h4>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span>{chapter.wordCount || 0} words</span>
                      <span>•</span>
                      <span>Added {new Date(chapter.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {isAuthor && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditChapter(chapter)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteChapterMutation.mutate(chapter.id)}
                        disabled={deleteChapterMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}