import { 
  users, stories, chapters, readingProgress, translations, audiobooks, userLibrary,
  type User, type InsertUser, type Story, type InsertStory, 
  type Chapter, type InsertChapter, type ReadingProgress, type InsertReadingProgress,
  type Translation, type InsertTranslation, type Audiobook, type InsertAudiobook,
  type UserLibrary, type InsertUserLibrary
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
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeSampleData();
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
      }).returning();

      // Create sample stories
      await db.insert(stories).values([
        {
          title: "The Lion and the Wise Tortoise",
          description: "A traditional African tale about wisdom overcoming strength, teaching that intelligence and patience are more powerful than brute force.",
          content: "Long ago, in the golden grasslands of Africa, there lived a mighty lion who believed himself to be the wisest creature in all the land...",
          genre: "Folklore",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 245,
          likeCount: 89,
          tags: ["African folklore", "wisdom", "animals", "traditional"],
        },
        {
          title: "The Girl Who Spoke to Stars",
          description: "A mystical tale of Amara, a young girl who discovers her ability to communicate with celestial beings and must use this gift to save her village.",
          content: "In a village nestled between rolling hills and vast skies, lived a girl named Amara whose eyes held the depth of twilight...",
          genre: "Fantasy",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 178,
          likeCount: 124,
          tags: ["African mythology", "stars", "magic", "coming-of-age"],
        },
        {
          title: "Ubuntu: The Village That Learned to Share",
          description: "A heartwarming story about how the African philosophy of Ubuntu transformed a divided community into a thriving, unified village.",
          content: "In the valley of the singing river lived two neighboring villages: Tukelo and Kopano. Though they shared the same water source and breathed the same air...",
          genre: "Cultural",
          language: "en",
          isPublished: true,
          isFeatured: true,
          authorId: sampleAuthor.id,
          readCount: 312,
          likeCount: 156,
          tags: ["Ubuntu", "community", "African philosophy", "sharing"],
        }
      ]);
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  private initializeSampleData() {
    // Sample author
    const sampleAuthor: User = {
      id: this.currentUserId++,
      firebaseUid: "sample-author-uid",
      username: "storyteller",
      email: "storyteller@example.com",
      displayName: "Master Storyteller",
      photoURL: null,
      bio: "Passionate about sharing cultural stories from Africa",
      preferredLanguage: "en",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(sampleAuthor.id, sampleAuthor);

    // Sample stories
    const stories = [
      {
        id: this.currentStoryId++,
        title: "The Lion and the Wise Tortoise",
        description: "A traditional African tale about wisdom triumphing over strength",
        content: `In the heart of the African savanna, there lived a mighty lion who believed himself to be the wisest creature in all the land. His golden mane shone brilliantly in the sunlight, and his roar could be heard for miles around.

One day, as the lion was boasting about his intelligence to the other animals, a small tortoise slowly approached. "Great lion," said the tortoise in a calm voice, "I have heard much about your wisdom. Would you be willing to accept a challenge that would prove it to all?"

The lion laughed heartily. "A challenge from you, little tortoise? This should be amusing. What do you propose?"

"There is a great baobab tree at the edge of our territory," the tortoise explained. "Whoever can reach it first and bring back one of its fruits shall be declared the wisest. But there is one rule - we must both travel by the same path, and we cannot use any tricks or shortcuts."

The lion agreed immediately, confident in his speed and strength. The next morning, as the sun rose over the horizon, both animals set off toward the distant baobab tree.

The lion sprinted ahead with powerful strides, leaving the tortoise far behind. But in his haste and arrogance, he didn't notice the deep ravine that lay across the path. When he reached it, he realized he would have to go around - a journey that would take many hours.

Meanwhile, the tortoise continued at his steady pace. When he reached the ravine, he had already noticed it from afar and had been thinking of a solution. He called out to a family of elephants who were drinking nearby.

"Friends," said the tortoise, "I am on an important journey to the baobab tree. The lion has challenged me, believing that speed alone makes one wise. But I believe wisdom lies in preparation and asking for help when needed. Would you be kind enough to help me cross this ravine?"

The elephants, who had grown tired of the lion's arrogance, gladly agreed. The largest elephant carefully picked up the tortoise with his trunk and placed him on the other side.

When the tortoise finally reached the baobab tree, he found the lion already there, exhausted and frustrated. The lion had spent hours finding a way around the ravine and had only just arrived.

"How did you get here so quickly?" the lion asked in amazement.

"While you rushed ahead without thinking," the tortoise replied, "I took time to observe the path and prepared for the obstacles I might face. When I encountered the ravine, I remembered that true wisdom lies not in doing everything alone, but in building friendships and knowing when to ask for help."

The tortoise picked up a ripe baobab fruit and began his journey home. The lion, humbled by this experience, followed slowly behind, thinking deeply about what he had learned.

From that day forward, the lion became known not just for his strength, but for his willingness to listen and learn from others, no matter how small they might be. And the tortoise became the respected advisor to all the animals, teaching them that wisdom comes not from being the fastest or the strongest, but from being thoughtful, prepared, and kind to others.

The baobab tree still stands at the edge of the savanna, its fruit a reminder that in life, as in stories, the greatest victories often come to those who combine patience with wisdom, and who understand that we are all stronger when we help one another.`,
        genre: "cultural",
        language: "en",
        authorId: sampleAuthor.id,
        isPublished: true,
        readCount: 156,
        likeCount: 89,
        chapterCount: 1,
        estimatedReadTime: 8,
        coverImage: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: this.currentStoryId++,
        title: "The Girl Who Spoke to Stars",
        description: "A young girl's journey to save her village using ancient wisdom",
        content: `In a small village nestled between rolling hills and vast open sky, there lived a girl named Naledi, whose name meant 'star' in her language. Unlike other children her age, Naledi spent her evenings gazing at the night sky, listening to the whispers of the stars.

Her grandmother had taught her the old ways - how to read the patterns in the sky, how to understand the language of the wind, and how to respect the ancient spirits that watched over their land. But many in the village had forgotten these traditions, choosing instead to focus on modern ways of living.

One season, a terrible drought came to the land. The rivers dried up, the crops withered, and the village well ran dangerously low. The village council met day after day, trying to find solutions, but nothing seemed to work.

As the situation grew desperate, Naledi remembered her grandmother's stories about the Star Guardian - an ancient spirit who could bring rain to those who honored the old covenant between earth and sky. That night, she climbed to the highest hill outside the village.

Under the vast canopy of stars, Naledi began to sing the ancient songs her grandmother had taught her. She sang of the connection between all living things, of gratitude for the earth's gifts, and of respect for the balance of nature.

As her voice carried across the stillness of the night, something magical began to happen. The stars seemed to pulse brighter, and a gentle wind began to blow. In the distance, clouds started to gather - the first clouds anyone had seen in months.

But Naledi knew that singing alone would not be enough. The Star Guardian required action, not just words. She spent the next day going from house to house, teaching the villagers the old songs and reminding them of the traditions that had sustained their ancestors for generations.

Some laughed at the young girl, calling her superstitious. But others remembered their grandparents' stories and joined her. Soon, a group of villagers was gathered on the hill, singing together under the stars.

On the third night, as their voices rose in harmony, the clouds opened up, and rain began to fall. It was gentle at first, then steady, soaking the grateful earth and refilling the streams.

The village was saved, but more importantly, the people had rediscovered their connection to the land and to each other. They established a new tradition - every month, the community would gather on the hill to sing to the stars, ensuring that the ancient wisdom would never be forgotten again.

Naledi grew up to become the village's keeper of traditions, teaching children the old songs and stories. She reminded everyone that sometimes the answers we seek are not found in new technologies or modern solutions, but in the wisdom of those who came before us, written in the stars and carried in the wind.

Years later, visitors would come from far and wide to hear about the village that spoke to stars. And Naledi would always tell them the same thing: "The stars have always been there, waiting to guide us. We just need to remember how to listen."`,
        genre: "fantasy",
        language: "en",
        authorId: sampleAuthor.id,
        isPublished: true,
        readCount: 203,
        likeCount: 134,
        chapterCount: 1,
        estimatedReadTime: 10,
        coverImage: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: this.currentStoryId++,
        title: "Ubuntu: The Village That Learned to Share",
        description: "A story about community, sharing, and the African philosophy of Ubuntu",
        content: `Long ago, in a village where the acacia trees provided shade and the red earth was rich with stories, there lived a community that had forgotten the meaning of Ubuntu - the belief that "I am because we are."

The village had grown prosperous over the years. Each family had built high walls around their homes, keeping their good fortune to themselves. Neighbors rarely spoke to one another, and when times were hard for some, others looked away.

In this village lived an old woman named Gogo Themba, whose small hut sat at the edge of the settlement. She was poor in material possessions but rich in wisdom and kindness. Every morning, she would greet her neighbors with a warm smile, offer help to anyone who needed it, and share whatever little food she had.

Most people ignored Gogo Themba, considering her too old and too poor to matter. But she continued her acts of kindness, believing deeply in the old ways where a community was only as strong as its most vulnerable member.

One year, a severe drought struck the region. The wealthy families had stored enough water and food to last, but they refused to share with their struggling neighbors. Desperation began to creep into the village as some families faced starvation.

During this difficult time, a stranger arrived at the village - a tall, dignified man who asked for shelter and food. One by one, he approached the wealthy homes, but each family turned him away, claiming they had nothing to spare.

Finally, the stranger came to Gogo Themba's humble hut. Though she had very little, she welcomed him warmly, shared her last piece of bread with him, and gave him her own sleeping mat while she slept on the hard ground.

"Grandmother," the stranger said, "you have given me everything you have, yet I can see you have almost nothing. Why do you share so freely?"

Gogo Themba smiled and replied, "My child, Ubuntu teaches us that we are all connected. Your hunger is my hunger, your comfort is my comfort. When I lift you up, I lift myself up too."

That night, something extraordinary happened. The stranger revealed himself to be Nomvelo, an ancient spirit guardian of the African people. Moved by Gogo Themba's Ubuntu spirit, he decided to teach the village a lesson.

The next morning, all the stored food and water in the wealthy homes had mysteriously vanished, while Gogo Themba's small garden flourished with fresh vegetables and a new well appeared beside her hut.

The wealthy families, now desperate, came to Gogo Themba begging for help. Without hesitation, she opened her door to everyone. "Come," she said, "there is enough for all of us, but only if we share."

As the villagers worked together - drawing water from the well, harvesting vegetables, and preparing meals to share - something beautiful began to happen. The spirit of Ubuntu was reborn in their community.

Neighbors began talking to each other again, children played together across property lines, and families started sharing their skills and resources. The village walls came down, not just physically, but emotionally and spiritually.

When the rains finally returned, the village was transformed. They had learned that their true wealth lay not in what they hoarded for themselves, but in what they shared with others. They established new traditions: community gardens, shared harvests, and regular gatherings where everyone contributed what they could and took only what they needed.

Gogo Themba lived to see her village become famous throughout the region as a place where Ubuntu flourished. Visitors would come to learn about the community that had rediscovered the truth that individual success means nothing without collective wellbeing.

Even today, the villagers begin each day by saying "Sawubona," which means "I see you," recognizing the full humanity and worth of every person they encounter. They understand that Ubuntu is not just a philosophy - it is a way of living that makes everyone stronger, happier, and more fulfilled.

The acacia trees still provide shade, the red earth still tells stories, and the spirit of Ubuntu continues to guide a community that learned the greatest lesson of all: we are human because of other humans, and we find our highest purpose in lifting each other up.`,
        genre: "cultural",
        language: "en",
        authorId: sampleAuthor.id,
        isPublished: true,
        readCount: 287,
        likeCount: 198,
        chapterCount: 1,
        estimatedReadTime: 12,
        coverImage: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }
    ];

    stories.forEach(story => {
      this.stories.set(story.id, story);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      displayName: insertUser.displayName || null,
      photoURL: insertUser.photoURL || null,
      bio: insertUser.bio || null,
      preferredLanguage: insertUser.preferredLanguage || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Story methods
  async getStory(id: number): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getStoriesByAuthor(authorId: number): Promise<Story[]> {
    return Array.from(this.stories.values()).filter(story => story.authorId === authorId);
  }

  async getPublishedStories(limit = 50): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.isPublished)
      .slice(0, limit);
  }

  async getFeaturedStories(): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.isPublished)
      .sort((a, b) => (b.readCount || 0) - (a.readCount || 0))
      .slice(0, 6);
  }

  async searchStories(query: string): Promise<Story[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.stories.values())
      .filter(story => 
        story.isPublished && (
          story.title.toLowerCase().includes(lowercaseQuery) ||
          story.description?.toLowerCase().includes(lowercaseQuery)
        )
      );
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.currentStoryId++;
    const story: Story = {
      ...insertStory,
      id,
      description: insertStory.description || null,
      coverImage: insertStory.coverImage || null,
      language: insertStory.language || null,
      isPublished: insertStory.isPublished || null,
      chapterCount: insertStory.chapterCount || null,
      estimatedReadTime: insertStory.estimatedReadTime || null,
      readCount: 0,
      likeCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: number, updates: Partial<InsertStory>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;
    
    const updatedStory = { ...story, ...updates, updatedAt: new Date() };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: number): Promise<boolean> {
    return this.stories.delete(id);
  }

  // Chapter methods
  async getChapter(id: number): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async getChaptersByStory(storyId: number): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(chapter => chapter.storyId === storyId)
      .sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = this.currentChapterId++;
    const chapter: Chapter = {
      ...insertChapter,
      id,
      wordCount: insertChapter.wordCount || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: number, updates: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const chapter = this.chapters.get(id);
    if (!chapter) return undefined;
    
    const updatedChapter = { ...chapter, ...updates, updatedAt: new Date() };
    this.chapters.set(id, updatedChapter);
    return updatedChapter;
  }

  async deleteChapter(id: number): Promise<boolean> {
    return this.chapters.delete(id);
  }

  // Reading progress methods
  async getReadingProgress(userId: number, storyId: number): Promise<ReadingProgress | undefined> {
    const key = `${userId}-${storyId}`;
    return this.readingProgress.get(key);
  }

  async updateReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress> {
    const key = `${progress.userId}-${progress.storyId}`;
    const existingProgress = this.readingProgress.get(key);
    
    if (existingProgress) {
      const updatedProgress = { ...existingProgress, ...progress, lastReadAt: new Date() };
      this.readingProgress.set(key, updatedProgress);
      return updatedProgress;
    } else {
      const id = this.currentProgressId++;
      const newProgress: ReadingProgress = {
        ...progress,
        id,
        chapterId: progress.chapterId || null,
        currentPosition: progress.currentPosition || null,
        completed: progress.completed || null,
        lastReadAt: new Date(),
      };
      this.readingProgress.set(key, newProgress);
      return newProgress;
    }
  }

  // Translation methods
  async getTranslation(storyId: number, language: string, chapterId?: number): Promise<Translation | undefined> {
    const key = `${storyId}-${language}-${chapterId || 'story'}`;
    return this.translations.get(key);
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const id = this.currentTranslationId++;
    const key = `${translation.storyId}-${translation.targetLanguage}-${translation.chapterId || 'story'}`;
    const newTranslation: Translation = {
      ...translation,
      id,
      chapterId: translation.chapterId || null,
      createdAt: new Date(),
    };
    this.translations.set(key, newTranslation);
    return newTranslation;
  }

  // Audiobook methods
  async getAudiobook(storyId: number, language: string, chapterId?: number): Promise<Audiobook | undefined> {
    const key = `${storyId}-${language}-${chapterId || 'story'}`;
    return this.audiobooks.get(key);
  }

  async createAudiobook(audiobook: InsertAudiobook): Promise<Audiobook> {
    const id = this.currentAudiobookId++;
    const key = `${audiobook.storyId}-${audiobook.language}-${audiobook.chapterId || 'story'}`;
    const newAudiobook: Audiobook = {
      ...audiobook,
      id,
      chapterId: audiobook.chapterId || null,
      audioUrl: audiobook.audioUrl || null,
      duration: audiobook.duration || null,
      createdAt: new Date(),
    };
    this.audiobooks.set(key, newAudiobook);
    return newAudiobook;
  }

  // User library methods
  async getUserLibrary(userId: number): Promise<Story[]> {
    const libraryEntries = Array.from(this.userLibrary.values())
      .filter(entry => entry.userId === userId);
    
    const stories: Story[] = [];
    for (const entry of libraryEntries) {
      const story = this.stories.get(entry.storyId);
      if (story) {
        stories.push(story);
      }
    }
    return stories;
  }

  async addToLibrary(userId: number, storyId: number): Promise<UserLibrary> {
    const id = this.currentLibraryId++;
    const key = `${userId}-${storyId}`;
    const libraryEntry: UserLibrary = {
      id,
      userId,
      storyId,
      addedAt: new Date(),
    };
    this.userLibrary.set(key, libraryEntry);
    return libraryEntry;
  }

  async removeFromLibrary(userId: number, storyId: number): Promise<boolean> {
    const key = `${userId}-${storyId}`;
    return this.userLibrary.delete(key);
  }
}

export const storage = new DatabaseStorage();
