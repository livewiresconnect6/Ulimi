import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { insertStorySchema } from "@shared/schema";
import { Save, Eye, Upload, Bold, Italic, Underline, Image, Languages } from "lucide-react";

const writeFormSchema = insertStorySchema.extend({
  content: z.string().min(100, "Story content must be at least 100 characters"),
});

type WriteFormData = z.infer<typeof writeFormSchema>;

export default function Write() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user: appUser } = useAuth();
  const queryClient = useQueryClient();
  const [wordCount, setWordCount] = useState(0);
  const [isPreview, setIsPreview] = useState(false);

  const form = useForm<WriteFormData>({
    resolver: zodResolver(writeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      coverImage: "",
      genre: "",
      language: "en",
      authorId: appUser?.id || 0,
      isPublished: false,
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: WriteFormData) => {
      const response = await apiRequest("POST", "/api/stories", data);
      return response.json();
    },
    onSuccess: (story) => {
      toast({
        title: "Story created successfully!",
        description: "Your story has been saved and published.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      setLocation(`/read/${story.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create story. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: WriteFormData) => {
      const draftData = { ...data, isPublished: false };
      const response = await apiRequest("POST", "/api/stories", draftData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Draft saved",
        description: "Your story draft has been saved.",
      });
    },
  });

  const onSubmit = (data: WriteFormData) => {
    if (!appUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a story.",
        variant: "destructive",
      });
      return;
    }

    const finalData = { ...data, authorId: appUser.id, isPublished: true };
    createStoryMutation.mutate(finalData);
  };

  const handleSaveDraft = () => {
    if (!appUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save a draft.",
        variant: "destructive",
      });
      return;
    }

    const formData = form.getValues();
    const draftData = { ...formData, authorId: appUser.id };
    saveDraftMutation.mutate(draftData);
  };

  const handleContentChange = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    form.setValue("content", content);
  };

  if (!appUser) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold text-primary mb-4">Sign In to Write</h2>
              <p className="text-gray-600 mb-6">You need to be signed in to create stories.</p>
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-primary">Write Your Story</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPreview(!isPreview)}
                  disabled={!form.getValues("content")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {isPreview ? "Edit" : "Preview"}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {!isPreview ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Story Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Story Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your story title..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Genre" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="romance">Romance</SelectItem>
                              <SelectItem value="mystery">Mystery</SelectItem>
                              <SelectItem value="fantasy">Fantasy</SelectItem>
                              <SelectItem value="drama">Drama</SelectItem>
                              <SelectItem value="adventure">Adventure</SelectItem>
                              <SelectItem value="cultural">Cultural</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Story Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief description of your story..." 
                            rows={3} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <ImageUpload
                          currentImage={field.value}
                          onImageChange={field.onChange}
                          label="Story Cover Image"
                          className="mb-6"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Editor Toolbar */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                    <Button type="button" variant="ghost" size="sm">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <Button type="button" variant="ghost" size="sm">
                      <Image className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      <Languages className="h-4 w-4" />
                    </Button>
                    <div className="flex-1"></div>
                    <span className="text-sm text-gray-500">{wordCount} words</span>
                  </div>

                  {/* Main Editor */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Start writing your story here..."
                            className="min-h-96 text-lg leading-relaxed resize-none"
                            {...field}
                            onChange={(e) => handleContentChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-6 bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={saveDraftMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Draft
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setLocation("/")}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createStoryMutation.isPending}
                        className="bg-accent hover:bg-orange-600"
                      >
                        {createStoryMutation.isPending ? "Publishing..." : "Publish Story"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            ) : (
              /* Preview Mode */
              <div className="space-y-6">
                <div className="text-center pb-8 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-primary mb-4">
                    {form.getValues("title") || "Your Story Title"}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {form.getValues("description") || "Your story description"}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <span>By {appUser.displayName || appUser.username}</span>
                    <span>•</span>
                    <span>{Math.ceil(wordCount / 200)} min read</span>
                    <span>•</span>
                    <span>{form.getValues("genre") || "Genre"}</span>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none leading-relaxed">
                  {form.getValues("content") ? (
                    <div className="whitespace-pre-wrap">
                      {form.getValues("content")}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Start writing to see your story preview...</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
