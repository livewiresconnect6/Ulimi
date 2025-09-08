import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph, Avatar, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface Story {
  id: number;
  title: string;
  description: string;
  author: string;
  readCount: number;
  genre: string;
  coverImage?: string;
}

const HomeScreen = ({ navigation }: any) => {
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);

  useEffect(() => {
    // Mock data for demonstration - in real app, fetch from API
    setFeaturedStories([
      {
        id: 1,
        title: "The Girl Who Spoke to Stars",
        description: "A mystical tale of Amara, a young girl who discovers her ability to communicate with celestial beings.",
        author: "Nomsa Dlamini",
        readCount: 178,
        genre: "Fantasy",
      },
      {
        id: 2,
        title: "Ubuntu: The Village That Learned to Share",
        description: "A heartwarming story about how the African philosophy of Ubuntu transformed a divided community.",
        author: "Nomsa Dlamini",
        readCount: 156,
        genre: "Cultural",
      }
    ]);

    setRecentStories([
      {
        id: 3,
        title: "The Digital Divide",
        description: "Young Kwame's journey to bring internet to his rural village.",
        author: "Nomsa Dlamini",
        readCount: 89,
        genre: "Contemporary",
      }
    ]);
  }, []);

  const StoryCard = ({ story }: { story: Story }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate('Read', { storyId: story.id })}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Avatar.Text size={40} label={story.author.charAt(0)} />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{story.author}</Text>
              <Chip mode="outlined" compact>{story.genre}</Chip>
            </View>
          </View>
          <Title style={styles.storyTitle}>{story.title}</Title>
          <Paragraph style={styles.storyDescription} numberOfLines={2}>
            {story.description}
          </Paragraph>
          <View style={styles.cardFooter}>
            <View style={styles.readCount}>
              <MaterialIcons name="visibility" size={16} color="#666" />
              <Text style={styles.readCountText}>{story.readCount} reads</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Audiobook', { storyId: story.id })}
            >
              <MaterialIcons name="headphones" size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ulimi</Text>
        <Text style={styles.headerSubtitle}>Discover Stories in Your Language</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Stories</Text>
          {featuredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Stories</Text>
          {recentStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Browse')}
          >
            <MaterialIcons name="explore" size={24} color="#fff" />
            <Text style={styles.exploreButtonText}>Explore More Stories</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  storyCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  storyDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  exploreButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default HomeScreen;