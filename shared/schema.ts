import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  bio: text("bio"),
  preferredLanguage: text("preferred_language").default("en"),
  // Onboarding preferences
  userType: text("user_type").array(), // educator, writer, casual_reader
  preferredGenres: text("preferred_genres").array(), // fiction and non-fiction genres
  topicsOfInterest: text("topics_of_interest").array(), // various topics
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  genre: text("genre").notNull(),
  language: text("language").default("en"),
  authorId: integer("author_id").references(() => users.id).notNull(),
  isPublished: boolean("is_published").default(false),
  isDraft: boolean("is_draft").default(true),
  isFeatured: boolean("is_featured").default(false),
  readCount: integer("read_count").default(0),
  likeCount: integer("like_count").default(0),
  chapterCount: integer("chapter_count").default(1),
  estimatedReadTime: integer("estimated_read_time"), // in minutes
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  wordCount: integer("word_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  chapterId: integer("chapter_id").references(() => chapters.id),
  currentPosition: integer("current_position").default(0), // character position
  lastReadAt: timestamp("last_read_at").defaultNow(),
  completed: boolean("completed").default(false),
});

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  chapterId: integer("chapter_id").references(() => chapters.id),
  language: text("language").notNull(),
  targetLanguage: text("target_language").notNull(),
  translatedContent: text("translated_content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audiobooks = pgTable("audiobooks", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  chapterId: integer("chapter_id").references(() => chapters.id),
  language: text("language").notNull(),
  audioUrl: text("audio_url"),
  duration: integer("duration"), // in seconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLibrary = pgTable("user_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const customAudioUploads = pgTable("custom_audio_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  chapterId: integer("chapter_id").references(() => chapters.id),
  audioUrl: text("audio_url").notNull(),
  filename: text("filename").notNull(),
  fileSize: integer("file_size").notNull(),
  duration: integer("duration"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const storyLikes = pgTable("story_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoriteStories = pgTable("favorite_stories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoriteAuthors = pgTable("favorite_authors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const featuredAuthors = pgTable("featured_authors", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  featuredAt: timestamp("featured_at").defaultNow(),
  displayOrder: integer("display_order").default(0),
});

export const authorLikes = pgTable("author_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoriteAuthorsUsers = pgTable("favorite_authors_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const authorLibrary = pgTable("author_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  subscriberId: integer("subscriber_id").references(() => users.id).notNull(),
  subscribedToId: integer("subscribed_to_id").references(() => users.id).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

export const audioRecordings = pgTable("audio_recordings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  storyId: integer("story_id").references(() => stories.id).notNull(),
  chapterId: integer("chapter_id").references(() => chapters.id),
  title: text("title").notNull(),
  audioUrl: text("audio_url").notNull(),
  duration: integer("duration"), // in seconds
  fileSize: integer("file_size"),
  isPublic: boolean("is_public").default(false),
  isSubscriberOnly: boolean("is_subscriber_only").default(true),
  playCount: integer("play_count").default(0),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const audioRecordingLikes = pgTable("audio_recording_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  recordingId: integer("recording_id").references(() => audioRecordings.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  stories: many(stories),
  readingProgress: many(readingProgress),
  userLibrary: many(userLibrary),
  customAudioUploads: many(customAudioUploads),
  storyLikes: many(storyLikes),
  favoriteStories: many(favoriteStories),
  favoriteAuthors: many(favoriteAuthors),
  featuredAuthorEntries: many(featuredAuthors),
  authorLikes: many(authorLikes),
  favoriteAuthorsUsers: many(favoriteAuthorsUsers),
  authorLibrary: many(authorLibrary),
  subscribersOf: many(userSubscriptions, { relationName: "subscribersOf" }),
  subscriptions: many(userSubscriptions, { relationName: "subscriptions" }),
  audioRecordings: many(audioRecordings),
  audioRecordingLikes: many(audioRecordingLikes),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  author: one(users, {
    fields: [stories.authorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  readingProgress: many(readingProgress),
  translations: many(translations),
  audiobooks: many(audiobooks),
  userLibrary: many(userLibrary),
  customAudioUploads: many(customAudioUploads),
  storyLikes: many(storyLikes),
  favoriteStories: many(favoriteStories),
}));

export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  story: one(stories, {
    fields: [chapters.storyId],
    references: [stories.id],
  }),
  translations: many(translations),
  audiobooks: many(audiobooks),
  customAudioUploads: many(customAudioUploads),
}));

export const readingProgressRelations = relations(readingProgress, ({ one }) => ({
  user: one(users, {
    fields: [readingProgress.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [readingProgress.storyId],
    references: [stories.id],
  }),
}));

export const translationsRelations = relations(translations, ({ one }) => ({
  story: one(stories, {
    fields: [translations.storyId],
    references: [stories.id],
  }),
  chapter: one(chapters, {
    fields: [translations.chapterId],
    references: [chapters.id],
  }),
}));

export const audiobooksRelations = relations(audiobooks, ({ one }) => ({
  story: one(stories, {
    fields: [audiobooks.storyId],
    references: [stories.id],
  }),
  chapter: one(chapters, {
    fields: [audiobooks.chapterId],
    references: [chapters.id],
  }),
}));

export const userLibraryRelations = relations(userLibrary, ({ one }) => ({
  user: one(users, {
    fields: [userLibrary.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [userLibrary.storyId],
    references: [stories.id],
  }),
}));

export const customAudioUploadsRelations = relations(customAudioUploads, ({ one }) => ({
  user: one(users, {
    fields: [customAudioUploads.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [customAudioUploads.storyId],
    references: [stories.id],
  }),
  chapter: one(chapters, {
    fields: [customAudioUploads.chapterId],
    references: [chapters.id],
  }),
}));

export const storyLikesRelations = relations(storyLikes, ({ one }) => ({
  user: one(users, {
    fields: [storyLikes.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [storyLikes.storyId],
    references: [stories.id],
  }),
}));

export const favoriteStoriesRelations = relations(favoriteStories, ({ one }) => ({
  user: one(users, {
    fields: [favoriteStories.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [favoriteStories.storyId],
    references: [stories.id],
  }),
}));

export const favoriteAuthorsRelations = relations(favoriteAuthors, ({ one }) => ({
  user: one(users, {
    fields: [favoriteAuthors.userId],
    references: [users.id],
  }),
  author: one(users, {
    fields: [favoriteAuthors.authorId],
    references: [users.id],
  }),
}));

export const featuredAuthorsRelations = relations(featuredAuthors, ({ one }) => ({
  author: one(users, {
    fields: [featuredAuthors.authorId],
    references: [users.id],
  }),
}));

export const authorLikesRelations = relations(authorLikes, ({ one }) => ({
  user: one(users, {
    fields: [authorLikes.userId],
    references: [users.id],
  }),
  author: one(users, {
    fields: [authorLikes.authorId],
    references: [users.id],
  }),
}));

export const favoriteAuthorsUsersRelations = relations(favoriteAuthorsUsers, ({ one }) => ({
  user: one(users, {
    fields: [favoriteAuthorsUsers.userId],
    references: [users.id],
  }),
  author: one(users, {
    fields: [favoriteAuthorsUsers.authorId],
    references: [users.id],
  }),
}));

export const authorLibraryRelations = relations(authorLibrary, ({ one }) => ({
  user: one(users, {
    fields: [authorLibrary.userId],
    references: [users.id],
  }),
  author: one(users, {
    fields: [authorLibrary.authorId],
    references: [users.id],
  }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  subscriber: one(users, {
    fields: [userSubscriptions.subscriberId],
    references: [users.id],
    relationName: "subscribersOf",
  }),
  subscribedTo: one(users, {
    fields: [userSubscriptions.subscribedToId],
    references: [users.id],
    relationName: "subscriptions",
  }),
}));

export const audioRecordingsRelations = relations(audioRecordings, ({ one, many }) => ({
  user: one(users, {
    fields: [audioRecordings.userId],
    references: [users.id],
  }),
  story: one(stories, {
    fields: [audioRecordings.storyId],
    references: [stories.id],
  }),
  chapter: one(chapters, {
    fields: [audioRecordings.chapterId],
    references: [chapters.id],
  }),
  likes: many(audioRecordingLikes),
}));

export const audioRecordingLikesRelations = relations(audioRecordingLikes, ({ one }) => ({
  user: one(users, {
    fields: [audioRecordingLikes.userId],
    references: [users.id],
  }),
  recording: one(audioRecordings, {
    fields: [audioRecordingLikes.recordingId],
    references: [audioRecordings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  readCount: true,
  likeCount: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
});

export const insertTranslationSchema = createInsertSchema(translations).omit({
  id: true,
  createdAt: true,
});

export const insertAudiobookSchema = createInsertSchema(audiobooks).omit({
  id: true,
  createdAt: true,
});

export const insertUserLibrarySchema = createInsertSchema(userLibrary).omit({
  id: true,
  addedAt: true,
});

export const insertCustomAudioUploadSchema = createInsertSchema(customAudioUploads).omit({
  id: true,
  uploadedAt: true,
});

export const insertStoryLikeSchema = createInsertSchema(storyLikes).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteStorySchema = createInsertSchema(favoriteStories).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteAuthorSchema = createInsertSchema(favoriteAuthors).omit({
  id: true,
  createdAt: true,
});

export const insertFeaturedAuthorSchema = createInsertSchema(featuredAuthors).omit({
  id: true,
  featuredAt: true,
});

export const insertAuthorLikeSchema = createInsertSchema(authorLikes).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteAuthorUserSchema = createInsertSchema(favoriteAuthorsUsers).omit({
  id: true,
  createdAt: true,
});

export const insertAuthorLibrarySchema = createInsertSchema(authorLibrary).omit({
  id: true,
  addedAt: true,
});

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  subscribedAt: true,
});

export const insertAudioRecordingSchema = createInsertSchema(audioRecordings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  playCount: true,
  likeCount: true,
});

export const insertAudioRecordingLikeSchema = createInsertSchema(audioRecordingLikes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Audiobook = typeof audiobooks.$inferSelect;
export type InsertAudiobook = z.infer<typeof insertAudiobookSchema>;
export type UserLibrary = typeof userLibrary.$inferSelect;
export type InsertUserLibrary = z.infer<typeof insertUserLibrarySchema>;
export type CustomAudioUpload = typeof customAudioUploads.$inferSelect;
export type InsertCustomAudioUpload = z.infer<typeof insertCustomAudioUploadSchema>;
export type StoryLike = typeof storyLikes.$inferSelect;
export type InsertStoryLike = z.infer<typeof insertStoryLikeSchema>;
export type FavoriteStory = typeof favoriteStories.$inferSelect;
export type InsertFavoriteStory = z.infer<typeof insertFavoriteStorySchema>;
export type FavoriteAuthor = typeof favoriteAuthors.$inferSelect;
export type InsertFavoriteAuthor = z.infer<typeof insertFavoriteAuthorSchema>;
export type FeaturedAuthor = typeof featuredAuthors.$inferSelect;
export type InsertFeaturedAuthor = z.infer<typeof insertFeaturedAuthorSchema>;
export type AuthorLike = typeof authorLikes.$inferSelect;
export type InsertAuthorLike = z.infer<typeof insertAuthorLikeSchema>;
export type FavoriteAuthorUser = typeof favoriteAuthorsUsers.$inferSelect;
export type InsertFavoriteAuthorUser = z.infer<typeof insertFavoriteAuthorUserSchema>;
export type AuthorLibrary = typeof authorLibrary.$inferSelect;
export type InsertAuthorLibrary = z.infer<typeof insertAuthorLibrarySchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type AudioRecording = typeof audioRecordings.$inferSelect;
export type InsertAudioRecording = z.infer<typeof insertAudioRecordingSchema>;
export type AudioRecordingLike = typeof audioRecordingLikes.$inferSelect;
export type InsertAudioRecordingLike = z.infer<typeof insertAudioRecordingLikeSchema>;
