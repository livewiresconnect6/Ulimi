import { 
  users, stories, chapters, readingProgress, translations, audiobooks, userLibrary,
  storyLikes, favoriteStories, favoriteAuthors, featuredAuthors, authorLikes, 
  favoriteAuthorsUsers, authorLibrary, userSubscriptions, audioRecordings, audioRecordingLikes,
  type User, type InsertUser, type Story, type InsertStory, 
  type Chapter, type InsertChapter, type ReadingProgress, type InsertReadingProgress,
  type Translation, type InsertTranslation, type Audiobook, type InsertAudiobook,
  type UserLibrary, type InsertUserLibrary, type StoryLike, type InsertStoryLike,
  type FavoriteStory, type InsertFavoriteStory, type FavoriteAuthor, type InsertFavoriteAuthor,
  type FeaturedAuthor, type InsertFeaturedAuthor, type AuthorLike, type InsertAuthorLike,
  type FavoriteAuthorUser, type InsertFavoriteAuthorUser, type AuthorLibrary, type InsertAuthorLibrary,
  type UserSubscription, type InsertUserSubscription, type AudioRecording, type InsertAudioRecording,
  type AudioRecordingLike, type InsertAudioRecordingLike
} from "../shared/schema";
import { db } from "./db";
import { eq, like, desc, and, ilike } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Story methods
  getStory(id: number): Promise<Story | undefined>;
  getStoriesByAuthor(authorId: number): Promise<Story[]>;
  getPublishedStories(limit?: number): Promise<Story[]>;
  getFeaturedStories(): Promise<Story[]>;
  searchStories(query: string): Promise<Story[]>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: number): Promise<boolean>;

  // Chapter methods
  getChapter(id: number): Promise<Chapter | undefined>;
  getChaptersByStory(storyId: number): Promise<Chapter[]>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: number, updates: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: number): Promise<boolean>;

  // Reading progress methods
  getReadingProgress(userId: number, storyId: number): Promise<ReadingProgress | undefined>;
  updateReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;

  // Translation methods
  getTranslation(storyId: number, language: string, chapterId?: number): Promise<Translation | undefined>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;

  // Audiobook methods
  getAudiobook(storyId: number, language: string, chapterId?: number): Promise<Audiobook | undefined>;
  createAudiobook(audiobook: InsertAudiobook): Promise<Audiobook>;

  // User library methods
  getUserLibrary(userId: number): Promise<Story[]>;
  addToLibrary(userId: number, storyId: number): Promise<UserLibrary>;
  removeFromLibrary(userId: number, storyId: number): Promise<boolean>;

  // Story likes methods
  likeStory(userId: number, storyId: number): Promise<StoryLike>;
  unlikeStory(userId: number, storyId: number): Promise<boolean>;
  getStoryLikes(storyId: number): Promise<number>;
  isStoryLiked(userId: number, storyId: number): Promise<boolean>;

  // Favorite stories methods
  addToFavorites(userId: number, storyId: number): Promise<FavoriteStory>;
  removeFromFavorites(userId: number, storyId: number): Promise<boolean>;
  getFavoriteStories(userId: number): Promise<Story[]>;
  isStoryFavorited(userId: number, storyId: number): Promise<boolean>;

  // Favorite authors methods
  followAuthor(userId: number, authorId: number): Promise<FavoriteAuthor>;
  unfollowAuthor(userId: number, authorId: number): Promise<boolean>;
  getFavoriteAuthors(userId: number): Promise<User[]>;
  isAuthorFollowed(userId: number, authorId: number): Promise<boolean>;

  // Featured authors methods
  getFeaturedAuthors(): Promise<User[]>;
  addFeaturedAuthor(authorId: number, displayOrder?: number): Promise<FeaturedAuthor>;
  removeFeaturedAuthor(authorId: number): Promise<boolean>;

  // Author likes methods
  likeAuthor(userId: number, authorId: number): Promise<AuthorLike>;
  unlikeAuthor(userId: number, authorId: number): Promise<boolean>;
  getAuthorLikes(authorId: number): Promise<number>;
  isAuthorLiked(userId: number, authorId: number): Promise<boolean>;

  // Author favorites methods
  addAuthorToFavorites(userId: number, authorId: number): Promise<FavoriteAuthorUser>;
  removeAuthorFromFavorites(userId: number, authorId: number): Promise<boolean>;
  getFavoriteAuthorsByUser(userId: number): Promise<User[]>;
  isAuthorFavorited(userId: number, authorId: number): Promise<boolean>;

  // Author library methods
  addAuthorToLibrary(userId: number, authorId: number): Promise<AuthorLibrary>;
  removeAuthorFromLibrary(userId: number, authorId: number): Promise<boolean>;
  getAuthorLibrary(userId: number): Promise<User[]>;
  isAuthorInLibrary(userId: number, authorId: number): Promise<boolean>;

  // User subscription methods
  subscribeToUser(subscriberId: number, subscribedToId: number): Promise<UserSubscription>;
  unsubscribeFromUser(subscriberId: number, subscribedToId: number): Promise<boolean>;
  getUserSubscriptions(userId: number): Promise<User[]>;
  getSubscribers(userId: number): Promise<User[]>;
  isSubscribedTo(subscriberId: number, subscribedToId: number): Promise<boolean>;

  // Audio recording methods
  createAudioRecording(recording: InsertAudioRecording): Promise<AudioRecording>;
  getAudioRecording(id: number): Promise<AudioRecording | undefined>;
  getAudioRecordingsByUser(userId: number): Promise<AudioRecording[]>;
  getAudioRecordingsByStory(storyId: number): Promise<AudioRecording[]>;
  getAudioRecordingsByChapter(chapterId: number): Promise<AudioRecording[]>;
  updateAudioRecording(id: number, updates: Partial<InsertAudioRecording>): Promise<AudioRecording | undefined>;
  deleteAudioRecording(id: number): Promise<boolean>;
  likeAudioRecording(userId: number, recordingId: number): Promise<AudioRecordingLike>;
  unlikeAudioRecording(userId: number, recordingId: number): Promise<boolean>;
  isAudioRecordingLiked(userId: number, recordingId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private async ensureInitialized() {
    // Disabled sample data initialization for fresh start
    this.initialized = true;
  }

  async initializeSampleData() {
    try {
      // Check if sample data already exists
      const existingStories = await db.select().from(stories).limit(1);
      if (existingStories.length > 0) {
        return; // Data already exists
      }

      // Create sample author
      const [sampleAuthor] = await db.insert(users).values({
        firebaseUid: "demo-author-uid",
        username: "african_storyteller",
        email: "storyteller@demo.com",
        displayName: "Noma Themba",
        bio: "Traditional storyteller sharing African wisdom through tales.",
        preferredLanguage: "en",
        userType: null,
        preferredGenres: null,
        topicsOfInterest: null,
      }).returning();

      // Create sample stories with multiple chapters
      const storiesData = [
        {
          title: "A Christmas Carol",
          description: "Charles Dickens' timeless tale of Ebenezer Scrooge's transformation from a miserly old man to a generous soul, guided by three spirits on Christmas Eve.",
          content: "A Christmas Carol summary - This beloved classic follows the journey of Ebenezer Scrooge as he learns the true meaning of Christmas through supernatural visitations.",
          genre: "Classic",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 1245,
          likeCount: 389,
          chapterCount: 5,
          tags: null,
        },
        {
          title: "The Adventures of Tom Sawyer",
          description: "Mark Twain's classic novel about a mischievous boy growing up along the Mississippi River, filled with adventure, friendship, and coming-of-age wisdom.",
          content: "Tom Sawyer summary - Follow the adventures of Tom Sawyer as he navigates childhood in a small Missouri town, getting into trouble and discovering what it means to grow up.",
          genre: "Adventure",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 892,
          likeCount: 267,
          chapterCount: 6,
          tags: null,
        },
        {
          title: "Alice's Adventures in Wonderland",
          description: "Lewis Carroll's whimsical tale of a young girl who falls down a rabbit hole into a fantasy world populated by peculiar creatures and nonsensical logic.",
          content: "Alice in Wonderland summary - Join Alice as she tumbles into a magical world where nothing is quite as it seems, meeting unforgettable characters along the way.",
          genre: "Fantasy",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 756,
          likeCount: 198,
          chapterCount: 7,
          tags: null,
        },
        {
          title: "Ubuntu: The Village That Learned to Share",
          description: "A heartwarming story about how the African philosophy of Ubuntu transformed a divided community into a thriving, unified village.",
          content: `In the valley of the singing river lived two neighboring villages: Tukelo and Kopano. Though they shared the same water source and breathed the same air, the people of these villages had forgotten how to share anything else.

Tukelo village prided itself on individual achievement. Each family kept to itself, accumulating wealth and knowledge like squirrels storing nuts for winter. "Every person for themselves," was their motto.

Kopano village wasn't much different. They too believed that success meant having more than their neighbors. Competition ran so deep that neighbors would hide their harvest techniques and refuse to help each other in times of need.

Then came the year of the great challenges. First, locusts devoured half the crops. Then, a flash flood damaged the main bridge connecting both villages to the trading post. Finally, a sickness spread that left many too weak to tend their fields.

In Tukelo, families with food refused to share with those who had none. "We worked hard for this," they said. "Let others work harder."

In Kopano, it was the same. Healthy families avoided the sick, afraid of catching the illness. Knowledge of herbal remedies was guarded jealously.

But there was one person who moved between both villages: an old woman named MaUbuntu. She had been born in Tukelo but married into Kopano, and she remembered the old ways.

One evening, as she watched children from both villages growing thin and families growing bitter, MaUbuntu stood at the river that connected their lands and began to speak:

"My children," her voice carried across the water, "do you know what your names mean? Tukelo means 'we are one' and Kopano means 'we come together.' Your ancestors chose these names for a reason."

She continued, "There is an old word: Ubuntu. It means 'I am because we are.' A person is a person through other people. When one suffers, we all suffer. When one thrives, we all have the possibility to thrive."

That night, MaUbuntu did something that shocked both villages. She took her family's entire grain reserve and placed it at the riverbank between the two villages. "This is for anyone who needs it," she announced.

At first, people were suspicious. But as days passed and they watched MaUbuntu give without expecting anything in return, something began to shift.

A young father from Tukelo, seeing his child's hunger, swallowed his pride and took some grain. In return, he quietly left his best fishing nets for others to use.

A grandmother from Kopano, moved by this gesture, brought her special herb mixture that could treat the sickness. Soon, a small pile of shared resources grew at the riverbank.

Slowly, tentatively, people began to help each other. Tukelo's skilled farmers taught Kopano's people new planting techniques. Kopano's herbal healers shared their knowledge with Tukelo. Children from both villages played together while their parents worked side by side to rebuild the bridge.

The transformation was remarkable. Not only did both villages recover from their hardships, but they thrived like never before. The combined knowledge, resources, and labor created abundance that neither village could have achieved alone.

Years later, the two villages officially became one, taking the name Ubuntu Village. At its center stood a statue of MaUbuntu with an inscription: "I am because we are."

Visitors would often ask the villagers the secret of their prosperity. The answer was always the same: "We learned that when we lift each other up, we all rise higher. When we share our light, the whole world becomes brighter."

And indeed, Ubuntu Village became known throughout the region as a place where no one went hungry, no child lacked education, and no elder was forgotten. They had rediscovered an ancient truth: that humanity's greatest strength lies not in individual achievement, but in our connection to one another.

The river still sings as it flows through the village, and if you listen carefully, it seems to whisper the eternal wisdom: "Ubuntu – I am because we are."`,
          genre: "Cultural",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 312,
          likeCount: 156,
          chapterCount: 4,
          tags: null,
        }
      ];

      // Insert stories
      await db.insert(stories).values(storiesData);

      // Create chapters for the stories
      const chapterData = [
        // A Christmas Carol chapters
        { storyId: 1, chapterNumber: 1, title: "Marley's Ghost", content: "Scrooge encounters the ghost of his former business partner Jacob Marley, who warns him of three spirits that will visit him." },
        { storyId: 1, chapterNumber: 2, title: "The First of the Three Spirits", content: "The Ghost of Christmas Past shows Scrooge scenes from his younger days, revealing how he became bitter and isolated." },
        { storyId: 1, chapterNumber: 3, title: "The Second of the Three Spirits", content: "The Ghost of Christmas Present shows Scrooge how people are celebrating Christmas in the current year, including his nephew and the Cratchit family." },
        { storyId: 1, chapterNumber: 4, title: "The Last of the Spirits", content: "The Ghost of Christmas Yet to Come shows Scrooge a possible future where he dies alone and unmourned." },
        { storyId: 1, chapterNumber: 5, title: "The End of It", content: "Scrooge awakens on Christmas morning transformed, becoming generous and kind to all around him." },

        // Tom Sawyer chapters  
        { storyId: 2, chapterNumber: 1, title: "Tom Plays, Fights, and Hides", content: "Tom Sawyer's adventures begin as he skips school, gets into fights, and hides from Aunt Polly." },
        { storyId: 2, chapterNumber: 2, title: "The Glorious Whitewasher", content: "Tom cleverly tricks his friends into whitewashing the fence for him, making it seem like fun work." },
        { storyId: 2, chapterNumber: 3, title: "Tom as a General", content: "Tom organizes the boys into armies and leads them in mock battles and adventures." },
        { storyId: 2, chapterNumber: 4, title: "Mental Acrobatics", content: "Tom struggles with Sunday school lessons but finds ways to make even memorizing Bible verses into a game." },
        { storyId: 2, chapterNumber: 5, title: "The Pinch-Bug and His Prey", content: "Tom causes a commotion in church when he brings a pinch-bug that terrorizes the congregation." },
        { storyId: 2, chapterNumber: 6, title: "Tom Meets Becky", content: "Tom falls in love with Becky Thatcher and tries to win her attention through various schemes." },

        // Alice in Wonderland chapters
        { storyId: 3, chapterNumber: 1, title: "Down the Rabbit-Hole", content: "Alice follows a White Rabbit down a hole and falls into a strange underground world." },
        { storyId: 3, chapterNumber: 2, title: "The Pool of Tears", content: "Alice grows and shrinks after drinking from bottles, eventually swimming in a pool of her own tears." },
        { storyId: 3, chapterNumber: 3, title: "A Caucus-Race and a Long Tale", content: "Alice meets various animals who participate in a peculiar race with no clear winner." },
        { storyId: 3, chapterNumber: 4, title: "The Rabbit Sends in a Little Bill", content: "Alice grows too large for the White Rabbit's house, causing chaos and confusion." },
        { storyId: 3, chapterNumber: 5, title: "Advice from a Caterpillar", content: "Alice encounters a hookah-smoking caterpillar who gives her cryptic advice about changing size." },
        { storyId: 3, chapterNumber: 6, title: "Pig and Pepper", content: "Alice meets the Cheshire Cat and witnesses the Duchess's strange household with a crying baby." },
        { storyId: 3, chapterNumber: 7, title: "A Mad Tea-Party", content: "Alice joins the Mad Hatter, March Hare, and Dormouse for a nonsensical tea party." },

        // Ubuntu Village chapters
        { storyId: 4, chapterNumber: 1, title: "Two Divided Villages", content: "The story of Tukelo and Kopano villages, once united but now divided by pride and mistrust." },
        { storyId: 4, chapterNumber: 2, title: "The Wisdom of MaUbuntu", content: "An elder woman named MaUbuntu teaches the ancient philosophy of Ubuntu - 'I am because we are.'" },
        { storyId: 4, chapterNumber: 3, title: "The First Act of Sharing", content: "MaUbuntu places her family's grain at the riverbank, beginning the transformation of both communities." },
        { storyId: 4, chapterNumber: 4, title: "Ubuntu Village is Born", content: "The villages unite as Ubuntu Village, creating prosperity through cooperation and shared wisdom." }
      ];

      await db.insert(chapters).values(chapterData);

      // Add featured author
      await db.insert(featuredAuthors).values({
        authorId: sampleAuthor.id,
        displayOrder: 1,
      });

    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    await this.ensureInitialized();
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    await this.ensureInitialized();
    try {
      const result = await db.insert(users).values(insertUser).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user in database');
    }
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    await this.ensureInitialized();
    const [user] = await db.update(users)
      .set({ 
        ...updates,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Story methods
  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async getStoriesByAuthor(authorId: number): Promise<Story[]> {
    return await db.select().from(stories).where(eq(stories.authorId, authorId));
  }

  async getPublishedStories(limit = 50): Promise<Story[]> {
    return await db.select().from(stories)
      .where(eq(stories.isPublished, true))
      .orderBy(desc(stories.createdAt))
      .limit(limit);
  }

  async getFeaturedStories(): Promise<Story[]> {
    return await db.select().from(stories)
      .where(and(eq(stories.isPublished, true), eq(stories.isFeatured, true)))
      .orderBy(desc(stories.readCount));
  }

  async searchStories(query: string): Promise<Story[]> {
    return await db.select().from(stories)
      .where(
        and(
          eq(stories.isPublished, true),
          ilike(stories.title, `%${query}%`)
        )
      );
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db.insert(stories).values(insertStory).returning();
    return story;
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const [story] = await db.update(stories)
      .set({ 
        ...updates,
        updatedAt: new Date() 
      })
      .where(eq(stories.id, id))
      .returning();
    return story;
  }

  async deleteStory(id: number): Promise<boolean> {
    const result = await db.delete(stories).where(eq(stories.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Chapter methods
  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async getChaptersByStory(storyId: number): Promise<Chapter[]> {
    return await db.select().from(chapters)
      .where(eq(chapters.storyId, storyId))
      .orderBy(chapters.chapterNumber);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(insertChapter).returning();
    return chapter;
  }

  async updateChapter(id: number, updates: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const [chapter] = await db.update(chapters)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chapters.id, id))
      .returning();
    return chapter;
  }

  async deleteChapter(id: number): Promise<boolean> {
    const result = await db.delete(chapters).where(eq(chapters.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Reading progress methods
  async getReadingProgress(userId: number, storyId: number): Promise<ReadingProgress | undefined> {
    const [progress] = await db.select().from(readingProgress)
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.storyId, storyId)));
    return progress;
  }

  async updateReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress> {
    const existing = await this.getReadingProgress(progress.userId, progress.storyId);
    
    if (existing) {
      const [updated] = await db.update(readingProgress)
        .set(progress)
        .where(and(eq(readingProgress.userId, progress.userId), eq(readingProgress.storyId, progress.storyId)))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(readingProgress).values(progress).returning();
      return created;
    }
  }

  // Translation methods
  async getTranslation(storyId: number, language: string, chapterId?: number): Promise<Translation | undefined> {
    const conditions = [eq(translations.storyId, storyId), eq(translations.language, language)];
    if (chapterId) {
      conditions.push(eq(translations.chapterId, chapterId));
    }
    
    const [translation] = await db.select().from(translations).where(and(...conditions));
    return translation;
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const [created] = await db.insert(translations).values(translation).returning();
    return created;
  }

  // Audiobook methods
  async getAudiobook(storyId: number, language: string, chapterId?: number): Promise<Audiobook | undefined> {
    const conditions = [eq(audiobooks.storyId, storyId), eq(audiobooks.language, language)];
    if (chapterId) {
      conditions.push(eq(audiobooks.chapterId, chapterId));
    }
    
    const [audiobook] = await db.select().from(audiobooks).where(and(...conditions));
    return audiobook;
  }

  async createAudiobook(audiobook: InsertAudiobook): Promise<Audiobook> {
    const [created] = await db.insert(audiobooks).values(audiobook).returning();
    return created;
  }

  // User library methods
  async getUserLibrary(userId: number): Promise<Story[]> {
    const libraryEntries = await db.select({
      story: stories
    })
    .from(userLibrary)
    .innerJoin(stories, eq(userLibrary.storyId, stories.id))
    .where(eq(userLibrary.userId, userId));
    
    return libraryEntries.map(entry => entry.story);
  }

  async addToLibrary(userId: number, storyId: number): Promise<UserLibrary> {
    const [entry] = await db.insert(userLibrary)
      .values({ userId, storyId })
      .returning();
    return entry;
  }

  async removeFromLibrary(userId: number, storyId: number): Promise<boolean> {
    const result = await db.delete(userLibrary)
      .where(and(eq(userLibrary.userId, userId), eq(userLibrary.storyId, storyId)));
    return (result.rowCount || 0) > 0;
  }

  // Story likes methods
  async likeStory(userId: number, storyId: number): Promise<StoryLike> {
    const [like] = await db.insert(storyLikes)
      .values({ userId, storyId })
      .returning();
    
    return like;
  }

  async unlikeStory(userId: number, storyId: number): Promise<boolean> {
    const result = await db.delete(storyLikes)
      .where(and(eq(storyLikes.userId, userId), eq(storyLikes.storyId, storyId)));
    
    return (result.rowCount || 0) > 0;
  }

  async getStoryLikes(storyId: number): Promise<number> {
    const result = await db.select()
      .from(storyLikes)
      .where(eq(storyLikes.storyId, storyId));
    return result.length;
  }

  async isStoryLiked(userId: number, storyId: number): Promise<boolean> {
    const [like] = await db.select()
      .from(storyLikes)
      .where(and(eq(storyLikes.userId, userId), eq(storyLikes.storyId, storyId)));
    return !!like;
  }

  // Favorite stories methods
  async addToFavorites(userId: number, storyId: number): Promise<FavoriteStory> {
    const [favorite] = await db.insert(favoriteStories)
      .values({ userId, storyId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: number, storyId: number): Promise<boolean> {
    const result = await db.delete(favoriteStories)
      .where(and(eq(favoriteStories.userId, userId), eq(favoriteStories.storyId, storyId)));
    return (result.rowCount || 0) > 0;
  }

  async getFavoriteStories(userId: number): Promise<Story[]> {
    const favoriteStoriesWithData = await db.select({
      story: stories
    })
      .from(favoriteStories)
      .innerJoin(stories, eq(favoriteStories.storyId, stories.id))
      .where(eq(favoriteStories.userId, userId))
      .orderBy(desc(favoriteStories.createdAt));
    
    return favoriteStoriesWithData.map(item => item.story);
  }

  async isStoryFavorited(userId: number, storyId: number): Promise<boolean> {
    const [favorite] = await db.select()
      .from(favoriteStories)
      .where(and(eq(favoriteStories.userId, userId), eq(favoriteStories.storyId, storyId)));
    return !!favorite;
  }

  // Favorite authors methods
  async followAuthor(userId: number, authorId: number): Promise<FavoriteAuthor> {
    const [follow] = await db.insert(favoriteAuthors)
      .values({ userId, authorId })
      .returning();
    return follow;
  }

  async unfollowAuthor(userId: number, authorId: number): Promise<boolean> {
    const result = await db.delete(favoriteAuthors)
      .where(and(eq(favoriteAuthors.userId, userId), eq(favoriteAuthors.authorId, authorId)));
    return (result.rowCount || 0) > 0;
  }

  async getFavoriteAuthors(userId: number): Promise<User[]> {
    const favoriteAuthorsWithData = await db.select({
      author: users
    })
      .from(favoriteAuthors)
      .innerJoin(users, eq(favoriteAuthors.authorId, users.id))
      .where(eq(favoriteAuthors.userId, userId))
      .orderBy(desc(favoriteAuthors.createdAt));
    
    return favoriteAuthorsWithData.map(item => item.author);
  }

  async isAuthorFollowed(userId: number, authorId: number): Promise<boolean> {
    const [follow] = await db.select()
      .from(favoriteAuthors)
      .where(and(eq(favoriteAuthors.userId, userId), eq(favoriteAuthors.authorId, authorId)));
    return !!follow;
  }

  // Featured authors methods
  async getFeaturedAuthors(): Promise<User[]> {
    const featuredAuthorsWithData = await db.select({
      author: users
    })
      .from(featuredAuthors)
      .innerJoin(users, eq(featuredAuthors.authorId, users.id))
      .orderBy(featuredAuthors.displayOrder, desc(featuredAuthors.featuredAt));
    
    return featuredAuthorsWithData.map(item => item.author);
  }

  async addFeaturedAuthor(authorId: number, displayOrder = 0): Promise<FeaturedAuthor> {
    const [featured] = await db.insert(featuredAuthors)
      .values({ authorId, displayOrder })
      .returning();
    return featured;
  }

  async removeFeaturedAuthor(authorId: number): Promise<boolean> {
    const result = await db.delete(featuredAuthors)
      .where(eq(featuredAuthors.authorId, authorId));
    return (result.rowCount || 0) > 0;
  }

  // Author likes methods
  async likeAuthor(userId: number, authorId: number): Promise<AuthorLike> {
    const [like] = await db.insert(authorLikes)
      .values({ userId, authorId })
      .returning();
    return like;
  }

  async unlikeAuthor(userId: number, authorId: number): Promise<boolean> {
    const result = await db.delete(authorLikes)
      .where(and(eq(authorLikes.userId, userId), eq(authorLikes.authorId, authorId)));
    return (result.rowCount || 0) > 0;
  }

  async getAuthorLikes(authorId: number): Promise<number> {
    const likes = await db.select().from(authorLikes).where(eq(authorLikes.authorId, authorId));
    return likes.length;
  }

  async isAuthorLiked(userId: number, authorId: number): Promise<boolean> {
    const [like] = await db.select().from(authorLikes)
      .where(and(eq(authorLikes.userId, userId), eq(authorLikes.authorId, authorId)));
    return !!like;
  }

  // Author favorites methods
  async addAuthorToFavorites(userId: number, authorId: number): Promise<FavoriteAuthorUser> {
    const [favorite] = await db.insert(favoriteAuthorsUsers)
      .values({ userId, authorId })
      .returning();
    return favorite;
  }

  async removeAuthorFromFavorites(userId: number, authorId: number): Promise<boolean> {
    const result = await db.delete(favoriteAuthorsUsers)
      .where(and(eq(favoriteAuthorsUsers.userId, userId), eq(favoriteAuthorsUsers.authorId, authorId)));
    return (result.rowCount || 0) > 0;
  }

  async getFavoriteAuthorsByUser(userId: number): Promise<User[]> {
    const favorites = await db.select({
      user: users
    }).from(favoriteAuthorsUsers)
      .innerJoin(users, eq(favoriteAuthorsUsers.authorId, users.id))
      .where(eq(favoriteAuthorsUsers.userId, userId));
    
    return favorites.map(f => f.user);
  }

  async isAuthorFavorited(userId: number, authorId: number): Promise<boolean> {
    const [favorite] = await db.select().from(favoriteAuthorsUsers)
      .where(and(eq(favoriteAuthorsUsers.userId, userId), eq(favoriteAuthorsUsers.authorId, authorId)));
    return !!favorite;
  }

  // Author library methods
  async addAuthorToLibrary(userId: number, authorId: number): Promise<AuthorLibrary> {
    const [libraryEntry] = await db.insert(authorLibrary)
      .values({ userId, authorId })
      .returning();
    return libraryEntry;
  }

  async removeAuthorFromLibrary(userId: number, authorId: number): Promise<boolean> {
    const result = await db.delete(authorLibrary)
      .where(and(eq(authorLibrary.userId, userId), eq(authorLibrary.authorId, authorId)));
    return (result.rowCount || 0) > 0;
  }

  async getAuthorLibrary(userId: number): Promise<User[]> {
    const library = await db.select({
      user: users
    }).from(authorLibrary)
      .innerJoin(users, eq(authorLibrary.authorId, users.id))
      .where(eq(authorLibrary.userId, userId));
    
    return library.map(l => l.user);
  }

  async isAuthorInLibrary(userId: number, authorId: number): Promise<boolean> {
    const [entry] = await db.select().from(authorLibrary)
      .where(and(eq(authorLibrary.userId, userId), eq(authorLibrary.authorId, authorId)));
    return !!entry;
  }

  // User subscription methods implementation
  async subscribeToUser(subscriberId: number, subscribedToId: number): Promise<UserSubscription> {
    await this.ensureInitialized();
    const [subscription] = await db
      .insert(userSubscriptions)
      .values({ subscriberId, subscribedToId })
      .returning();
    return subscription;
  }

  async unsubscribeFromUser(subscriberId: number, subscribedToId: number): Promise<boolean> {
    await this.ensureInitialized();
    const result = await db
      .delete(userSubscriptions)
      .where(and(eq(userSubscriptions.subscriberId, subscriberId), eq(userSubscriptions.subscribedToId, subscribedToId)));
    return (result.rowCount || 0) > 0;
  }

  async getUserSubscriptions(userId: number): Promise<User[]> {
    await this.ensureInitialized();
    const subscriptions = await db
      .select({ user: users })
      .from(userSubscriptions)
      .leftJoin(users, eq(userSubscriptions.subscribedToId, users.id))
      .where(eq(userSubscriptions.subscriberId, userId));
    return subscriptions.map(s => s.user).filter(Boolean) as User[];
  }

  async getSubscribers(userId: number): Promise<User[]> {
    await this.ensureInitialized();
    const subscribers = await db
      .select({ user: users })
      .from(userSubscriptions)
      .leftJoin(users, eq(userSubscriptions.subscriberId, users.id))
      .where(eq(userSubscriptions.subscribedToId, userId));
    return subscribers.map(s => s.user).filter(Boolean) as User[];
  }

  async isSubscribedTo(subscriberId: number, subscribedToId: number): Promise<boolean> {
    await this.ensureInitialized();
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(and(eq(userSubscriptions.subscriberId, subscriberId), eq(userSubscriptions.subscribedToId, subscribedToId)));
    return !!subscription;
  }

  // Audio recording methods implementation
  async createAudioRecording(recording: InsertAudioRecording): Promise<AudioRecording> {
    await this.ensureInitialized();
    const [audioRecording] = await db
      .insert(audioRecordings)
      .values(recording)
      .returning();
    return audioRecording;
  }

  async getAudioRecording(id: number): Promise<AudioRecording | undefined> {
    await this.ensureInitialized();
    const [recording] = await db
      .select()
      .from(audioRecordings)
      .where(eq(audioRecordings.id, id));
    return recording;
  }

  async getAudioRecordingsByUser(userId: number): Promise<AudioRecording[]> {
    await this.ensureInitialized();
    return db
      .select()
      .from(audioRecordings)
      .where(eq(audioRecordings.userId, userId))
      .orderBy(desc(audioRecordings.createdAt));
  }

  async getAudioRecordingsByStory(storyId: number): Promise<AudioRecording[]> {
    await this.ensureInitialized();
    return db
      .select()
      .from(audioRecordings)
      .where(eq(audioRecordings.storyId, storyId))
      .orderBy(desc(audioRecordings.createdAt));
  }

  async getAudioRecordingsByChapter(chapterId: number): Promise<AudioRecording[]> {
    await this.ensureInitialized();
    return db
      .select()
      .from(audioRecordings)
      .where(eq(audioRecordings.chapterId, chapterId))
      .orderBy(desc(audioRecordings.createdAt));
  }

  async updateAudioRecording(id: number, updates: Partial<InsertAudioRecording>): Promise<AudioRecording | undefined> {
    await this.ensureInitialized();
    const [recording] = await db
      .update(audioRecordings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(audioRecordings.id, id))
      .returning();
    return recording;
  }

  async deleteAudioRecording(id: number): Promise<boolean> {
    await this.ensureInitialized();
    // First delete associated likes
    await db.delete(audioRecordingLikes).where(eq(audioRecordingLikes.recordingId, id));
    
    const result = await db
      .delete(audioRecordings)
      .where(eq(audioRecordings.id, id));
    return (result.rowCount || 0) > 0;
  }

  async likeAudioRecording(userId: number, recordingId: number): Promise<AudioRecordingLike> {
    await this.ensureInitialized();
    const [like] = await db
      .insert(audioRecordingLikes)
      .values({ userId, recordingId })
      .returning();
    
    // Update like count
    const likeCount = await db
      .select({ count: eq(audioRecordingLikes.recordingId, recordingId) })
      .from(audioRecordingLikes)
      .where(eq(audioRecordingLikes.recordingId, recordingId));
      
    await db
      .update(audioRecordings)
      .set({ likeCount: likeCount.length })
      .where(eq(audioRecordings.id, recordingId));
    
    return like;
  }

  async unlikeAudioRecording(userId: number, recordingId: number): Promise<boolean> {
    await this.ensureInitialized();
    const result = await db
      .delete(audioRecordingLikes)
      .where(and(eq(audioRecordingLikes.userId, userId), eq(audioRecordingLikes.recordingId, recordingId)));
    
    // Update like count
    if ((result.rowCount || 0) > 0) {
      const likeCount = await db
        .select({ count: eq(audioRecordingLikes.recordingId, recordingId) })
        .from(audioRecordingLikes)
        .where(eq(audioRecordingLikes.recordingId, recordingId));
        
      await db
        .update(audioRecordings)
        .set({ likeCount: likeCount.length })
        .where(eq(audioRecordings.id, recordingId));
    }
    
    return (result.rowCount || 0) > 0;
  }

  async isAudioRecordingLiked(userId: number, recordingId: number): Promise<boolean> {
    await this.ensureInitialized();
    const [like] = await db
      .select()
      .from(audioRecordingLikes)
      .where(and(eq(audioRecordingLikes.userId, userId), eq(audioRecordingLikes.recordingId, recordingId)));
    return !!like;
  }
}

export const storage = new DatabaseStorage();