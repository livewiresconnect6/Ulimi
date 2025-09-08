import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertChapterSchema, insertAudioRecordingSchema, insertUserSubscriptionSchema, 
  insertAudioRecordingLikeSchema 
} from "@shared/schema";
import { 
  insertUserSchema, insertStorySchema, insertChapterSchema, 
  insertReadingProgressSchema, insertTranslationSchema, insertAudiobookSchema,
  insertUserLibrarySchema, insertStoryLikeSchema, insertFavoriteStorySchema,
  insertFavoriteAuthorSchema, insertFeaturedAuthorSchema
} from "../shared/schema";
import { z } from "zod";

// Google Translate API setup
async function translateText(text: string, targetLanguage: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    throw new Error("Google Translate API key not configured");
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Username-based authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { username, email, password, displayName } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create new user
      const userData = {
        firebaseUid: `local-${username}-${Date.now()}`,
        username,
        email,
        displayName,
        photoURL: null,
        bio: '',
        preferredLanguage: 'en',
        userType: null,
        preferredGenres: null,
        topicsOfInterest: null,
        onboardingCompleted: false,
      };
      
      const newUser = await storage.createUser(userData);
      res.json(newUser);
    } catch (error) {
      console.error('Sign up error:', error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // For development mode, accept any password for existing users
      // In production, you would verify actual password hash here
      // For demo purposes, accept "demo" or any password in development
      const isValidPassword = password === 'demo' || 
                              password === 'password' || 
                              password === user.username || 
                              process.env.NODE_ENV !== 'production';
      
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Sign in error:', error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Password reset endpoint
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // In demo mode, always return success
      // In production, you'd send actual password reset email
      res.json({ 
        message: "If an account with that email exists, we've sent you a password reset link.",
        success: true 
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/firebase/:uid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("Updating user", id, "with data:", req.body);
      const updates = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("User update validation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const { author, search, featured } = req.query;
      
      if (featured === 'true') {
        const stories = await storage.getFeaturedStories();
        res.json(stories);
      } else if (search) {
        const stories = await storage.searchStories(search as string);
        res.json(stories);
      } else if (author) {
        const stories = await storage.getStoriesByAuthor(parseInt(author as string));
        res.json(stories);
      } else {
        const stories = await storage.getPublishedStories();
        res.json(stories);
      }
    } catch (error) {
      console.error('Stories API error:', error);
      res.status(500).json({ error: "Failed to get stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStory(parseInt(req.params.id));
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(500).json({ error: "Failed to get story" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    try {
      console.log('Creating story with data:', req.body);
      
      // Extract chapters and handle them separately
      const { chapters, ...storyData } = req.body;
      
      // Validate and create the story first
      const validatedStoryData = insertStorySchema.parse(storyData);
      const story = await storage.createStory(validatedStoryData);
      
      // If chapters are provided, create them
      if (chapters && Array.isArray(chapters)) {
        for (let i = 0; i < chapters.length; i++) {
          const chapter = chapters[i];
          if (chapter.content && chapter.content.trim()) {
            await storage.createChapter({
              storyId: story.id,
              title: chapter.title || `Chapter ${i + 1}`,
              content: chapter.content,
              chapterNumber: i + 1
            });
          }
        }
      }
      
      console.log('Story created successfully:', story.id);
      res.json(story);
    } catch (error) {
      console.error('Story creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(400).json({ error: "Failed to create story" });
    }
  });

  app.put("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertStorySchema.partial().parse(req.body);
      const story = await storage.updateStory(id, updates);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json(story);
    } catch (error) {
      res.status(400).json({ error: "Invalid story data" });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStory(id);
      if (!success) {
        return res.status(404).json({ error: "Story not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete story" });
    }
  });

  // Chapter routes
  app.get("/api/stories/:storyId/chapters", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const chapters = await storage.getChaptersByStory(storyId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chapters" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getChapter(parseInt(req.params.id));
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Failed to get chapter" });
    }
  });

  app.post("/api/chapters", async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(chapterData);
      res.json(chapter);
    } catch (error) {
      res.status(400).json({ error: "Invalid chapter data" });
    }
  });

  app.put("/api/chapters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertChapterSchema.partial().parse(req.body);
      const chapter = await storage.updateChapter(id, updates);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(400).json({ error: "Invalid chapter data" });
    }
  });

  // Translation routes
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage, storyId, chapterId } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Text and target language are required" });
      }

      // Check if translation already exists
      if (storyId) {
        const existingTranslation = await storage.getTranslation(storyId, targetLanguage, chapterId);
        if (existingTranslation) {
          return res.json({ translatedText: existingTranslation.translatedContent });
        }
      }

      const translatedText = await translateText(text, targetLanguage);
      
      // Save translation if storyId provided
      if (storyId) {
        await storage.createTranslation({
          storyId,
          chapterId: chapterId || null,
          language: 'en', // source language
          targetLanguage,
          translatedContent: translatedText,
        });
      }

      res.json({ translatedText });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  app.get("/api/stories/:storyId/translations/:language", async (req, res) => {
    try {
      const { storyId, language } = req.params;
      const { chapterId } = req.query;
      
      const translation = await storage.getTranslation(
        parseInt(storyId), 
        language, 
        chapterId ? parseInt(chapterId as string) : undefined
      );
      
      if (!translation) {
        return res.status(404).json({ error: "Translation not found" });
      }
      
      res.json(translation);
    } catch (error) {
      res.status(500).json({ error: "Failed to get translation" });
    }
  });

  // Reading progress routes
  app.get("/api/users/:userId/progress/:storyId", async (req, res) => {
    try {
      const { userId, storyId } = req.params;
      const progress = await storage.getReadingProgress(parseInt(userId), parseInt(storyId));
      res.json(progress || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to get reading progress" });
    }
  });

  app.post("/api/reading-progress", async (req, res) => {
    try {
      const progressData = insertReadingProgressSchema.parse(req.body);
      const progress = await storage.updateReadingProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid progress data" });
    }
  });

  // User library routes
  app.get("/api/users/:userId/library", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stories = await storage.getUserLibrary(userId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user library" });
    }
  });

  app.post("/api/users/:userId/library", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { storyId } = req.body;
      
      if (!storyId) {
        return res.status(400).json({ error: "Story ID is required" });
      }
      
      const libraryEntry = await storage.addToLibrary(userId, storyId);
      res.json(libraryEntry);
    } catch (error) {
      res.status(400).json({ error: "Failed to add to library" });
    }
  });

  app.delete("/api/users/:userId/library/:storyId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const storyId = parseInt(req.params.storyId);
      
      const success = await storage.removeFromLibrary(userId, storyId);
      if (!success) {
        return res.status(404).json({ error: "Library entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from library" });
    }
  });

  app.get("/api/users/:userId/library/:storyId/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const storyId = parseInt(req.params.storyId);
      
      const library = await storage.getUserLibrary(userId);
      const isInLibrary = library.some(story => story.id === storyId);
      
      res.json({ isInLibrary });
    } catch (error) {
      res.status(500).json({ error: "Failed to check library status" });
    }
  });

  // Audiobook routes
  app.post("/api/audiobooks", async (req, res) => {
    try {
      const audiobookData = insertAudiobookSchema.parse(req.body);
      const audiobook = await storage.createAudiobook(audiobookData);
      res.json(audiobook);
    } catch (error) {
      res.status(400).json({ error: "Invalid audiobook data" });
    }
  });

  app.get("/api/stories/:storyId/audiobooks/:language", async (req, res) => {
    try {
      const { storyId, language } = req.params;
      const { chapterId } = req.query;
      
      const audiobook = await storage.getAudiobook(
        parseInt(storyId), 
        language, 
        chapterId ? parseInt(chapterId as string) : undefined
      );
      
      if (!audiobook) {
        return res.status(404).json({ error: "Audiobook not found" });
      }
      
      res.json(audiobook);
    } catch (error) {
      res.status(500).json({ error: "Failed to get audiobook" });
    }
  });

  // Story likes routes
  app.post("/api/stories/:storyId/like", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const like = await storage.likeStory(userId, storyId);
      res.json(like);
    } catch (error) {
      res.status(400).json({ error: "Failed to like story" });
    }
  });

  app.delete("/api/stories/:storyId/like", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const success = await storage.unlikeStory(userId, storyId);
      if (!success) {
        return res.status(404).json({ error: "Like not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unlike story" });
    }
  });

  app.get("/api/stories/:storyId/likes", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const count = await storage.getStoryLikes(storyId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get story likes" });
    }
  });

  app.get("/api/stories/:storyId/liked/:userId", async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const userId = parseInt(req.params.userId);
      const isLiked = await storage.isStoryLiked(userId, storyId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ error: "Failed to check if story is liked" });
    }
  });

  // Favorite stories routes
  app.post("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { storyId } = req.body;
      
      if (!storyId) {
        return res.status(400).json({ error: "Story ID is required" });
      }
      
      const favorite = await storage.addToFavorites(userId, storyId);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ error: "Failed to add to favorites" });
    }
  });

  app.delete("/api/users/:userId/favorites/:storyId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const storyId = parseInt(req.params.storyId);
      
      const success = await storage.removeFromFavorites(userId, storyId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from favorites" });
    }
  });

  app.get("/api/users/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stories = await storage.getFavoriteStories(userId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get favorite stories" });
    }
  });

  app.get("/api/users/:userId/favorites/:storyId/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const storyId = parseInt(req.params.storyId);
      const isFavorited = await storage.isStoryFavorited(userId, storyId);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  // Favorite authors routes
  app.post("/api/users/:userId/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { authorId } = req.body;
      
      if (!authorId) {
        return res.status(400).json({ error: "Author ID is required" });
      }
      
      const follow = await storage.followAuthor(userId, authorId);
      res.json(follow);
    } catch (error) {
      res.status(400).json({ error: "Failed to follow author" });
    }
  });

  app.delete("/api/users/:userId/following/:authorId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authorId = parseInt(req.params.authorId);
      
      const success = await storage.unfollowAuthor(userId, authorId);
      if (!success) {
        return res.status(404).json({ error: "Follow relationship not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unfollow author" });
    }
  });

  app.get("/api/users/:userId/following", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authors = await storage.getFavoriteAuthors(userId);
      res.json(authors);
    } catch (error) {
      res.status(500).json({ error: "Failed to get favorite authors" });
    }
  });

  app.get("/api/users/:userId/following/:authorId/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authorId = parseInt(req.params.authorId);
      const isFollowing = await storage.isAuthorFollowed(userId, authorId);
      res.json({ isFollowing });
    } catch (error) {
      res.status(500).json({ error: "Failed to check follow status" });
    }
  });

  // Author stats route
  app.get("/api/authors/:authorId/stats", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const stories = await storage.getStoriesByAuthor(authorId);
      const likesCount = await storage.getAuthorLikes(authorId);
      
      const storiesCount = stories.length;
      const followersCount = 0; // We'll implement this properly later
      
      res.json({ storiesCount, followersCount, likesCount });
    } catch (error) {
      res.status(500).json({ error: "Failed to get author stats" });
    }
  });

  // Author likes routes
  app.post("/api/authors/:authorId/like", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const like = await storage.likeAuthor(userId, authorId);
      res.json(like);
    } catch (error) {
      res.status(400).json({ error: "Failed to like author" });
    }
  });

  app.delete("/api/authors/:authorId/like", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const success = await storage.unlikeAuthor(userId, authorId);
      if (!success) {
        return res.status(404).json({ error: "Like not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unlike author" });
    }
  });

  app.get("/api/authors/:authorId/liked/:userId", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const userId = parseInt(req.params.userId);
      const isLiked = await storage.isAuthorLiked(userId, authorId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ error: "Failed to check like status" });
    }
  });

  // Author favorites routes
  app.post("/api/users/:userId/author-favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { authorId } = req.body;
      
      if (!authorId) {
        return res.status(400).json({ error: "Author ID is required" });
      }
      
      const favorite = await storage.addAuthorToFavorites(userId, authorId);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ error: "Failed to favorite author" });
    }
  });

  app.delete("/api/users/:userId/author-favorites/:authorId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authorId = parseInt(req.params.authorId);
      
      const success = await storage.removeAuthorFromFavorites(userId, authorId);
      if (!success) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unfavorite author" });
    }
  });

  app.get("/api/users/:userId/author-favorites/:authorId/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authorId = parseInt(req.params.authorId);
      const isFavorited = await storage.isAuthorFavorited(userId, authorId);
      res.json({ isFavorited });
    } catch (error) {
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  // Author library routes
  app.post("/api/users/:userId/author-library", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { authorId } = req.body;
      
      if (!authorId) {
        return res.status(400).json({ error: "Author ID is required" });
      }
      
      const libraryEntry = await storage.addAuthorToLibrary(userId, authorId);
      res.json(libraryEntry);
    } catch (error) {
      res.status(400).json({ error: "Failed to add author to library" });
    }
  });

  app.delete("/api/users/:userId/author-library/:authorId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authorId = parseInt(req.params.authorId);
      
      const success = await storage.removeAuthorFromLibrary(userId, authorId);
      if (!success) {
        return res.status(404).json({ error: "Library entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove author from library" });
    }
  });

  app.get("/api/users/:userId/author-library/:authorId/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const authorId = parseInt(req.params.authorId);
      const isInLibrary = await storage.isAuthorInLibrary(userId, authorId);
      res.json({ isInLibrary });
    } catch (error) {
      res.status(500).json({ error: "Failed to check library status" });
    }
  });

  // Featured authors routes
  app.get("/api/featured-authors", async (req, res) => {
    try {
      const authors = await storage.getFeaturedAuthors();
      res.json(authors);
    } catch (error) {
      res.status(500).json({ error: "Failed to get featured authors" });
    }
  });

  app.post("/api/featured-authors", async (req, res) => {
    try {
      const featuredAuthorData = insertFeaturedAuthorSchema.parse(req.body);
      const featured = await storage.addFeaturedAuthor(featuredAuthorData.authorId, featuredAuthorData.displayOrder || 0);
      res.json(featured);
    } catch (error) {
      res.status(400).json({ error: "Invalid featured author data" });
    }
  });

  app.delete("/api/featured-authors/:authorId", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const success = await storage.removeFeaturedAuthor(authorId);
      if (!success) {
        return res.status(404).json({ error: "Featured author not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove featured author" });
    }
  });

  // Author profile route
  app.get("/api/authors/:authorId", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const author = await storage.getUser(authorId);
      
      if (!author) {
        return res.status(404).json({ error: "Author not found" });
      }
      
      res.json(author);
    } catch (error) {
      res.status(500).json({ error: "Failed to get author" });
    }
  });

  app.get("/api/authors/:authorId/stories", async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const stories = await storage.getStoriesByAuthor(authorId);
      const publishedStories = stories.filter(story => story.isPublished);
      res.json(publishedStories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get author stories" });
    }
  });

  // User subscription routes
  app.post("/api/subscriptions", async (req, res) => {
    const { subscriberId, subscribedToId } = req.body;
    try {
      const subscription = await storage.subscribeToUser(subscriberId, subscribedToId);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  app.delete("/api/subscriptions/:subscriberId/:subscribedToId", async (req, res) => {
    const { subscriberId, subscribedToId } = req.params;
    try {
      const success = await storage.unsubscribeFromUser(parseInt(subscriberId), parseInt(subscribedToId));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Subscription not found" });
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ error: "Failed to delete subscription" });
    }
  });

  app.get("/api/users/:userId/subscriptions", async (req, res) => {
    const { userId } = req.params;
    try {
      const subscriptions = await storage.getUserSubscriptions(parseInt(userId));
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ error: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/users/:userId/subscribers", async (req, res) => {
    const { userId } = req.params;
    try {
      const subscribers = await storage.getSubscribers(parseInt(userId));
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  });

  app.get("/api/subscriptions/check/:subscriberId/:subscribedToId", async (req, res) => {
    const { subscriberId, subscribedToId } = req.params;
    try {
      const isSubscribed = await storage.isSubscribedTo(parseInt(subscriberId), parseInt(subscribedToId));
      res.json({ isSubscribed });
    } catch (error) {
      console.error("Error checking subscription:", error);
      res.status(500).json({ error: "Failed to check subscription" });
    }
  });

  // Audio recording routes
  app.post("/api/audio-recordings", async (req, res) => {
    const { userId, storyId, chapterId, title, audioUrl, duration, fileSize, isPublic, isSubscriberOnly } = req.body;
    try {
      const recording = await storage.createAudioRecording({
        userId,
        storyId,
        chapterId,
        title,
        audioUrl,
        duration,
        fileSize,
        isPublic,
        isSubscriberOnly
      });
      res.json(recording);
    } catch (error) {
      console.error("Error creating audio recording:", error);
      res.status(500).json({ error: "Failed to create audio recording" });
    }
  });

  app.get("/api/audio-recordings/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const recording = await storage.getAudioRecording(parseInt(id));
      if (recording) {
        res.json(recording);
      } else {
        res.status(404).json({ error: "Audio recording not found" });
      }
    } catch (error) {
      console.error("Error fetching audio recording:", error);
      res.status(500).json({ error: "Failed to fetch audio recording" });
    }
  });

  app.get("/api/users/:userId/audio-recordings", async (req, res) => {
    const { userId } = req.params;
    try {
      const recordings = await storage.getAudioRecordingsByUser(parseInt(userId));
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching user audio recordings:", error);
      res.status(500).json({ error: "Failed to fetch audio recordings" });
    }
  });

  app.get("/api/stories/:storyId/audio-recordings", async (req, res) => {
    const { storyId } = req.params;
    try {
      const recordings = await storage.getAudioRecordingsByStory(parseInt(storyId));
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching story audio recordings:", error);
      res.status(500).json({ error: "Failed to fetch audio recordings" });
    }
  });

  app.get("/api/chapters/:chapterId/audio-recordings", async (req, res) => {
    const { chapterId } = req.params;
    try {
      const recordings = await storage.getAudioRecordingsByChapter(parseInt(chapterId));
      res.json(recordings);
    } catch (error) {
      console.error("Error fetching chapter audio recordings:", error);
      res.status(500).json({ error: "Failed to fetch audio recordings" });
    }
  });

  app.put("/api/audio-recordings/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const recording = await storage.updateAudioRecording(parseInt(id), updates);
      if (recording) {
        res.json(recording);
      } else {
        res.status(404).json({ error: "Audio recording not found" });
      }
    } catch (error) {
      console.error("Error updating audio recording:", error);
      res.status(500).json({ error: "Failed to update audio recording" });
    }
  });

  app.delete("/api/audio-recordings/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const success = await storage.deleteAudioRecording(parseInt(id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Audio recording not found" });
      }
    } catch (error) {
      console.error("Error deleting audio recording:", error);
      res.status(500).json({ error: "Failed to delete audio recording" });
    }
  });

  app.post("/api/audio-recordings/:id/like", async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    try {
      const like = await storage.likeAudioRecording(userId, parseInt(id));
      res.json(like);
    } catch (error) {
      console.error("Error liking audio recording:", error);
      res.status(500).json({ error: "Failed to like audio recording" });
    }
  });

  app.delete("/api/audio-recordings/:id/like/:userId", async (req, res) => {
    const { id, userId } = req.params;
    try {
      const success = await storage.unlikeAudioRecording(parseInt(userId), parseInt(id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Like not found" });
      }
    } catch (error) {
      console.error("Error unliking audio recording:", error);
      res.status(500).json({ error: "Failed to unlike audio recording" });
    }
  });

  app.get("/api/audio-recordings/:id/like-check/:userId", async (req, res) => {
    const { id, userId } = req.params;
    try {
      const isLiked = await storage.isAudioRecordingLiked(parseInt(userId), parseInt(id));
      res.json({ isLiked });
    } catch (error) {
      console.error("Error checking audio recording like:", error);
      res.status(500).json({ error: "Failed to check like status" });
    }
  });

  // Chapter routes
  app.get("/api/stories/:storyId/chapters", async (req, res) => {
    const { storyId } = req.params;
    try {
      const chapters = await storage.getChaptersByStory(parseInt(storyId));
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching story chapters:", error);
      res.status(500).json({ error: "Failed to fetch chapters" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const chapter = await storage.getChapter(parseInt(id));
      if (chapter) {
        res.json(chapter);
      } else {
        res.status(404).json({ error: "Chapter not found" });
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  app.post("/api/chapters", async (req, res) => {
    const { storyId, title, content, chapterNumber } = req.body;
    try {
      const chapter = await storage.createChapter({
        storyId,
        title,
        content,
        chapterNumber,
      });
      res.json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ error: "Failed to create chapter" });
    }
  });

  app.put("/api/chapters/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const chapter = await storage.updateChapter(parseInt(id), updates);
      if (chapter) {
        res.json(chapter);
      } else {
        res.status(404).json({ error: "Chapter not found" });
      }
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ error: "Failed to update chapter" });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const success = await storage.deleteChapter(parseInt(id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Chapter not found" });
      }
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(500).json({ error: "Failed to delete chapter" });
    }
  });

  // Audio recording routes
  app.get('/api/audio-recordings/upload', async (req, res) => {
    try {
      // Get presigned URL for uploading audio file
      const uploadURL = `https://storage.googleapis.com/upload/audio-${Date.now()}.wav?uploadType=media`;
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ message: 'Failed to get upload URL' });
    }
  });

  app.post('/api/audio-recordings', async (req, res) => {
    try {
      const validatedData = insertAudioRecordingSchema.parse(req.body);
      const recording = await storage.createAudioRecording(validatedData);
      res.json(recording);
    } catch (error) {
      console.error('Error creating audio recording:', error);
      res.status(500).json({ message: 'Failed to create audio recording' });
    }
  });

  app.get('/api/audio-recordings', async (req, res) => {
    try {
      const { storyId, chapterId, authorId } = req.query;
      
      if (storyId) {
        const recordings = await storage.getAudioRecordingsByStory(parseInt(storyId as string));
        res.json(recordings);
      } else if (chapterId) {
        const recordings = await storage.getAudioRecordingsByChapter(parseInt(chapterId as string));
        res.json(recordings);
      } else if (authorId) {
        const recordings = await storage.getAudioRecordingsByUser(parseInt(authorId as string));
        res.json(recordings);
      } else {
        res.status(400).json({ message: 'Must provide storyId, chapterId, or authorId' });
      }
    } catch (error) {
      console.error('Error fetching audio recordings:', error);
      res.status(500).json({ message: 'Failed to fetch audio recordings' });
    }
  });

  app.post('/api/audio-recordings/:id/like', async (req, res) => {
    try {
      const recordingId = parseInt(req.params.id);
      const { userId } = req.body;
      
      const like = await storage.likeAudioRecording(userId, recordingId);
      res.json(like);
    } catch (error) {
      console.error('Error liking audio recording:', error);
      res.status(500).json({ message: 'Failed to like audio recording' });
    }
  });

  // Subscription routes
  app.post('/api/subscriptions', async (req, res) => {
    try {
      const validatedData = insertUserSubscriptionSchema.parse(req.body);
      const subscription = await storage.subscribeToUser(validatedData.subscriberId, validatedData.subscribedToId);
      res.json(subscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.delete('/api/subscriptions/:authorId', async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const { userId } = req.body;
      
      const success = await storage.unsubscribeFromUser(userId, authorId);
      if (success) {
        res.json({ message: 'Unsubscribed successfully' });
      } else {
        res.status(404).json({ message: 'Subscription not found' });
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      res.status(500).json({ message: 'Failed to unsubscribe' });
    }
  });

  app.get('/api/subscriptions/check', async (req, res) => {
    try {
      const { authorId, userId } = req.query;
      const isSubscribed = await storage.isSubscribedTo(
        parseInt(userId as string), 
        parseInt(authorId as string)
      );
      res.json(isSubscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ message: 'Failed to check subscription' });
    }
  });

  app.get('/api/subscriptions/count/:authorId', async (req, res) => {
    try {
      const authorId = parseInt(req.params.authorId);
      const subscribers = await storage.getSubscribers(authorId);
      res.json(subscribers.length);
    } catch (error) {
      console.error('Error getting subscriber count:', error);
      res.status(500).json({ message: 'Failed to get subscriber count' });
    }
  });

  // Chapter routes
  app.get('/api/chapters/:storyId', async (req, res) => {
    try {
      const storyId = parseInt(req.params.storyId);
      const chapters = await storage.getChaptersByStory(storyId);
      res.json(chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
      res.status(500).json({ message: 'Failed to fetch chapters' });
    }
  });

  app.post('/api/chapters', async (req, res) => {
    try {
      const validatedData = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(validatedData);
      
      // Update story's chapter count
      const chapters = await storage.getChaptersByStory(validatedData.storyId);
      await storage.updateStory(validatedData.storyId, { chapterCount: chapters.length });
      
      res.json(chapter);
    } catch (error) {
      console.error('Error creating chapter:', error);
      res.status(500).json({ message: 'Failed to create chapter' });
    }
  });

  app.patch('/api/chapters/:id', async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const updates = req.body;
      
      const chapter = await storage.updateChapter(chapterId, updates);
      if (chapter) {
        res.json(chapter);
      } else {
        res.status(404).json({ message: 'Chapter not found' });
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
      res.status(500).json({ message: 'Failed to update chapter' });
    }
  });

  app.delete('/api/chapters/:id', async (req, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapter(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: 'Chapter not found' });
      }
      
      const success = await storage.deleteChapter(chapterId);
      
      if (success) {
        // Update story's chapter count
        const remainingChapters = await storage.getChaptersByStory(chapter.storyId);
        await storage.updateStory(chapter.storyId, { chapterCount: remainingChapters.length });
        
        res.json({ message: 'Chapter deleted successfully' });
      } else {
        res.status(500).json({ message: 'Failed to delete chapter' });
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
      res.status(500).json({ message: 'Failed to delete chapter' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
