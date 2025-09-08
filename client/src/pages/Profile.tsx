import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoryCard } from "@/components/StoryCard";
import { ImageUpload } from "@/components/ImageUpload";
import { ProfilePhotoUpload } from "@/components/ProfilePhotoUpload";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { logout } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import { SUPPORTED_LANGUAGES } from "@/lib/translation";
import { insertUserSchema } from "@shared/schema";
import { 
  User, BookOpen, PenTool, Settings, LogOut, 
  Edit3, Save, Camera, Mail, Calendar, Globe 
} from "lucide-react";
import type { Story, User as AppUser } from "@shared/schema";

const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  displayName: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  preferredLanguage: z.string().default("en"),
  photoURL: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user: appUser, isAuthenticated, handleLogout: authLogout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: appUser?.username || "",
      displayName: appUser?.displayName || "",
      bio: appUser?.bio || "",
      preferredLanguage: appUser?.preferredLanguage || "en",
      photoURL: appUser?.photoURL ? appUser.photoURL : "",
    },
  });

  const { data: userStories, isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: [`/api/stories?author=${appUser?.id}`],
    enabled: isAuthenticated && !!appUser?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { photoURL?: string }) => {
      if (!appUser?.id) throw new Error("User not found");
      const response = await apiRequest("PUT", `/api/users/${appUser.id}`, data);
      return response.json();
    },
    onSuccess: (updatedUser: AppUser) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.setQueryData([`/api/users/firebase/${appUser?.firebaseUid}`], updatedUser);
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignOut = async () => {
    try {
      await authLogout();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling
      form.reset({
        username: appUser?.username || "",
        displayName: appUser?.displayName || "",
        bio: appUser?.bio || "",
        preferredLanguage: appUser?.preferredLanguage || "en",
      });
    }
    setIsEditing(!isEditing);
  };

  const handlePhotoUpdate = async (newPhotoUrl: string) => {
    if (!appUser) return;
    
    try {
      const updatedData = {
        ...appUser,
        photoURL: newPhotoUrl
      };
      
      updateProfileMutation.mutate({
        username: appUser.username,
        displayName: appUser.displayName || "",
        bio: appUser.bio || "",
        preferredLanguage: appUser.preferredLanguage || "en",
        photoURL: newPhotoUrl
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated || !appUser) {
    return (
      <div className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-4">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to view your profile and manage your account.
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

  const publishedStories = userStories?.filter(story => story.isPublished) || [];
  const draftStories = userStories?.filter(story => !story.isPublished) || [];
  const totalReads = publishedStories.reduce((sum, story) => sum + (story.readCount || 0), 0);
  const totalLikes = publishedStories.reduce((sum, story) => sum + (story.likeCount || 0), 0);

  return (
    <div className="pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              
              {/* Profile Photo Upload */}
              <ProfilePhotoUpload
                currentPhotoUrl={appUser.photoURL}
                onPhotoUpdate={handlePhotoUpdate}
                userName={appUser.displayName || appUser.username || 'User'}
                size="md"
              />
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-primary">
                    {appUser.displayName || appUser.username}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditToggle}
                      className="flex items-center"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4" />
                    {appUser.email}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Joined {new Date(appUser.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4" />
                    {SUPPORTED_LANGUAGES.find(lang => lang.code === appUser.preferredLanguage)?.name || 'English'}
                  </div>
                </div>
                
                {appUser.bio && !isEditing && (
                  <p className="mt-3 text-gray-700">{appUser.bio}</p>
                )}
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

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Profile Picture Upload */}
                  <FormField
                    control={form.control}
                    name="photoURL"
                    render={({ field }) => (
                      <FormItem>
                        <ImageUpload
                          currentImage={field.value}
                          onImageChange={field.onChange}
                          label="Profile Picture"
                          className="mb-6"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter username..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter display name..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your preferred language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about yourself..." 
                            rows={4} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-accent hover:bg-orange-600"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Stories Tabs */}
        <Tabs defaultValue="published" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="published" className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4" />
              Published ({publishedStories.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center">
              <PenTool className="mr-2 h-4 w-4" />
              Drafts ({draftStories.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="published">
            {storiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
                ))}
              </div>
            ) : publishedStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedStories.map((story) => (
                  <div key={story.id} className="relative">
                    <StoryCard
                      story={story}
                      author={appUser}
                      onClick={() => setLocation(`/read/${story.id}`)}
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 bg-green-100 text-green-600"
                    >
                      Published
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">No Published Stories</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't published any stories yet. Start writing to share your creativity with the world!
                  </p>
                  <Button 
                    onClick={() => setLocation("/write")} 
                    className="bg-accent hover:bg-orange-600"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Write Your First Story
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="drafts">
            {storiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
                ))}
              </div>
            ) : draftStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftStories.map((story) => (
                  <div key={story.id} className="relative">
                    <StoryCard
                      story={story}
                      author={appUser}
                      onClick={() => setLocation(`/write?edit=${story.id}`)}
                    />
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 bg-yellow-100 text-yellow-600"
                    >
                      Draft
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <PenTool className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-primary mb-2">No Draft Stories</h3>
                  <p className="text-gray-600 mb-6">
                    You don't have any draft stories. Start writing and save your work in progress here.
                  </p>
                  <Button 
                    onClick={() => setLocation("/write")} 
                    className="bg-accent hover:bg-orange-600"
                  >
                    <PenTool className="mr-2 h-4 w-4" />
                    Start Writing
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
