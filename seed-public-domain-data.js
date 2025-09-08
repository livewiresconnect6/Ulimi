// Public Domain Stories Seeding Script
// Run this with: node seed-public-domain-data.js

import { neon } from '@neondatabase/serverless';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL);

const publicDomainAuthors = [
  {
    username: "Lewis Carroll",
    email: "lewis@classic.lit",
    displayName: "Lewis Carroll",
    bio: "English author of beloved children's literature including Alice's Adventures in Wonderland",
    preferredLanguage: "en",
    userType: ["Writer"],
    preferredGenres: ["Fantasy", "Children"],
    topicsOfInterest: ["Writing", "Children's Literature"],
    onboardingCompleted: true
  },
  {
    username: "Aesop",
    email: "aesop@classic.lit", 
    displayName: "Aesop",
    bio: "Ancient Greek fabulist known for timeless moral tales and animal stories",
    preferredLanguage: "en",
    userType: ["Writer"],
    preferredGenres: ["Children", "Educational"],
    topicsOfInterest: ["Writing", "Education"],
    onboardingCompleted: true
  },
  {
    username: "Brothers Grimm",
    email: "grimm@classic.lit",
    displayName: "Brothers Grimm",
    bio: "German academics who collected and published European folk tales",
    preferredLanguage: "en", 
    userType: ["Writer"],
    preferredGenres: ["Fantasy", "Children"],
    topicsOfInterest: ["Writing", "Folklore"],
    onboardingCompleted: true
  },
  {
    username: "Hans Christian Andersen",
    email: "andersen@classic.lit",
    displayName: "Hans Christian Andersen", 
    bio: "Danish author famous for fairy tales like The Little Mermaid and The Ugly Duckling",
    preferredLanguage: "en",
    userType: ["Writer"],
    preferredGenres: ["Fantasy", "Children"],
    topicsOfInterest: ["Writing", "Children's Literature"],
    onboardingCompleted: true
  }
];

const publicDomainStories = [
  // Lewis Carroll Stories
  {
    title: "Alice's Adventures in Wonderland",
    genre: "Fantasy",
    language: "en",
    description: "A young girl falls down a rabbit hole into a fantasy world populated by peculiar creatures.",
    imageUrl: null,
    audioUrl: null,
    status: "published",
    chapters: [
      {
        title: "Chapter 1: Down the Rabbit Hole",
        content: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do. Once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it. 'And what is the use of a book,' thought Alice, 'without pictures or conversations?' So she was considering in her own mind, as well as she could, for the hot day made her feel very sleepy and stupid, whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her...",
        orderIndex: 1
      },
      {
        title: "Chapter 2: The Pool of Tears",
        content: "Curiouser and curiouser!' cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); 'now I'm opening out like the largest telescope that ever was! Good-bye, feet!' (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). 'Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I'm sure I shan't be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can...",
        orderIndex: 2
      }
    ]
  },
  // Aesop's Fables
  {
    title: "The Tortoise and the Hare",
    genre: "Educational", 
    language: "en",
    description: "A classic fable teaching that slow and steady wins the race.",
    imageUrl: null,
    audioUrl: null,
    status: "published",
    chapters: [
      {
        title: "The Race Begins",
        content: "A Hare was making fun of the Tortoise one day for being so slow. 'Do you ever get anywhere?' he asked with a mocking laugh. 'Yes,' replied the Tortoise, 'and I get there sooner than you think. I'll run you a race and prove it.' The Hare was much amused at the idea of running a race with the Tortoise, but for the fun of the thing he agreed. So the Fox, who had consented to act as judge, marked the distance and started the runners off...",
        orderIndex: 1
      },
      {
        title: "The Lesson Learned",  
        content: "The Hare ran swiftly ahead and soon left the Tortoise far behind. He was so confident of winning that he decided to take a nap midway through the race. Meanwhile, the Tortoise kept going slowly but steadily, and by the time the Hare woke up, the Tortoise was near the finish line. The Hare ran as fast as he could, but it was too late. The Tortoise had won the race. 'Slow and steady wins the race,' said the Fox.",
        orderIndex: 2
      }
    ]
  },
  // Brothers Grimm
  {
    title: "Cinderella",
    genre: "Fantasy",
    language: "en", 
    description: "A young woman's kindness leads her from rags to riches with help from her fairy godmother.",
    imageUrl: null,
    audioUrl: null,
    status: "published",
    chapters: [
      {
        title: "The Glass Slipper",
        content: "There was once a rich man whose wife lay sick, and when she felt her end drawing near she called to her only daughter to come near her bed, and said, 'Dear child, be pious and good, and God will always take care of you, and I will look down upon you from heaven, and will be with you.' And then she closed her eyes and expired. The maiden went every day to her mother's grave and wept, and was always pious and good. When the winter came the snow covered the grave with a white covering, and when the sun came in the early spring and melted it away, the man took to himself another wife...",
        orderIndex: 1
      }
    ]
  },
  // Hans Christian Andersen
  {
    title: "The Ugly Duckling", 
    genre: "Children",
    language: "en",
    description: "A story about self-acceptance and discovering one's true identity.",
    imageUrl: null,
    audioUrl: null,
    status: "published", 
    chapters: [
      {
        title: "The Different One",
        content: "It was lovely summer weather in the country, and the golden corn, the green oats, and the haystacks piled up in the meadows looked beautiful. The stork walking about on his long red legs chattered in the Egyptian language, which he had learnt from his mother. The corn-fields and meadows were surrounded by large forests, in the midst of which were deep pools. It was, indeed, delightful to walk about in the country. In a sunny spot stood a pleasant old farm-house close by a deep river, and from the house down to the water side grew great burdock leaves, so high, that under the tallest of them a little child could stand upright...",
        orderIndex: 1
      }
    ]
  }
];

async function seedPublicDomainData() {
  try {
    console.log('Starting to seed public domain data...');

    // Insert authors
    for (const author of publicDomainAuthors) {
      const existingUser = await sql`SELECT id FROM users WHERE username = ${author.username}`;
      if (existingUser.length === 0) {
        const newUser = await sql`
          INSERT INTO users (firebase_uid, username, email, display_name, photo_url, bio, preferred_language, user_type, preferred_genres, topics_of_interest, onboarding_completed, created_at, updated_at)
          VALUES (
            ${`local-${author.username}-${Date.now()}`}, 
            ${author.username}, 
            ${author.email}, 
            ${author.displayName}, 
            ${null}, 
            ${author.bio}, 
            ${author.preferredLanguage}, 
            ${JSON.stringify(author.userType)}, 
            ${JSON.stringify(author.preferredGenres)}, 
            ${JSON.stringify(author.topicsOfInterest)}, 
            ${author.onboardingCompleted}, 
            ${new Date().toISOString()}, 
            ${new Date().toISOString()}
          ) RETURNING id
        `;
        console.log(`Created author: ${author.displayName} (ID: ${newUser[0].id})`);
        
        // Find stories for this author and create them
        const authorStories = publicDomainStories.filter(story => {
          if (author.username === "Lewis Carroll") return story.title.includes("Alice");
          if (author.username === "Aesop") return story.title.includes("Tortoise");
          if (author.username === "Brothers Grimm") return story.title.includes("Cinderella");
          if (author.username === "Hans Christian Andersen") return story.title.includes("Duckling");
          return false;
        });

        for (const story of authorStories) {
          const newStory = await sql`
            INSERT INTO stories (author_id, title, genre, language, description, image_url, audio_url, status, created_at, updated_at)
            VALUES (
              ${newUser[0].id}, 
              ${story.title}, 
              ${story.genre}, 
              ${story.language}, 
              ${story.description}, 
              ${story.imageUrl}, 
              ${story.audioUrl}, 
              ${story.status}, 
              ${new Date().toISOString()}, 
              ${new Date().toISOString()}
            ) RETURNING id
          `;
          console.log(`Created story: ${story.title} (ID: ${newStory[0].id})`);

          // Create chapters for this story
          for (const chapter of story.chapters) {
            await sql`
              INSERT INTO chapters (story_id, title, content, order_index, created_at, updated_at)
              VALUES (
                ${newStory[0].id}, 
                ${chapter.title}, 
                ${chapter.content}, 
                ${chapter.orderIndex}, 
                ${new Date().toISOString()}, 
                ${new Date().toISOString()}
              )
            `;
            console.log(`  - Created chapter: ${chapter.title}`);
          }
        }
      } else {
        console.log(`Author ${author.displayName} already exists`);
      }
    }

    console.log('Successfully seeded public domain data!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Run the seeding function
await seedPublicDomainData();

export { seedPublicDomainData };