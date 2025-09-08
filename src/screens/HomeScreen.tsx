import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
  Surface,
  Avatar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

interface Story {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  genre: string;
  authorId: number;
  author?: {
    displayName: string;
    photoURL?: string;
  };
  readCount: number;
  likeCount: number;
  estimatedReadTime: number;
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [featuredStories, setFeaturedStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Fetch featured stories
      const featuredResponse = await fetch('http://10.0.2.2:5000/api/stories?featured=true');
      const featured = await featuredResponse.json();
      setFeaturedStories(featured.slice(0, 5));

      // Fetch recent stories
      const recentResponse = await fetch('http://10.0.2.2:5000/api/stories');
      const recent = await recentResponse.json();
      setRecentStories(recent.slice(0, 10));
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContent();
  };

  const renderStoryCard = ({ item }: { item: Story }) => (
    <Card style={styles.storyCard} onPress={() => navigation.navigate('Read', { id: item.id })}>
      <Card.Content>
        <View style={styles.storyHeader}>
          <Avatar.Text 
            size={40} 
            label={item.title.charAt(0).toUpperCase()} 
            style={styles.storyAvatar}
          />
          <View style={styles.storyInfo}>
            <Title style={styles.storyTitle} numberOfLines={2}>
              {item.title}
            </Title>
            <Paragraph style={styles.authorName}>
              by {item.author?.displayName || 'Anonymous'}
            </Paragraph>
          </View>
        </View>
        
        <Paragraph numberOfLines={3} style={styles.storyDescription}>
          {item.description}
        </Paragraph>
        
        <View style={styles.storyMeta}>
          <Chip mode="outlined" compact style={styles.genreChip}>
            {item.genre}
          </Chip>
          <View style={styles.storyStats}>
            <Text style={styles.statText}>👁 {item.readCount}</Text>
            <Text style={styles.statText}>❤️ {item.likeCount}</Text>
            <Text style={styles.statText}>⏱ {item.estimatedReadTime}m</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="🌟 Ulimi Stories" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="account-circle" 
          onPress={() => navigation.navigate('Profile')} 
          iconColor="#fff"
        />
        <Appbar.Action 
          icon="bell" 
          onPress={() => {/* Notifications */}} 
          iconColor="#fff"
        />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeGradient}>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.displayName || user?.username}! 📚
            </Text>
            <Text style={styles.welcomeSubtext}>
              Discover amazing stories in multiple languages
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Write')}
              >
                <Text style={styles.quickActionIcon}>✍️</Text>
                <Text style={styles.quickActionText}>Write</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Browse')}
              >
                <Text style={styles.quickActionIcon}>🔍</Text>
                <Text style={styles.quickActionText}>Browse</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => navigation.navigate('Library')}
              >
                <Text style={styles.quickActionIcon}>📚</Text>
                <Text style={styles.quickActionText}>Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Featured Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Featured Stories</Title>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Browse')}
              compact
            >
              See All
            </Button>
          </View>
          
          <FlatList
            data={featuredStories}
            renderItem={renderStoryCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Recent Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Recent Stories</Title>
            <Button 
              mode="text" 
              onPress={() => navigation.navigate('Browse')}
              compact
            >
              See All
            </Button>
          </View>
          
          {recentStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => navigation.navigate('Read', { id: story.id })}
            >
              {renderStoryCard({ item: story })}
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Surface style={styles.quickActions}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('Write')}
              style={styles.actionButton}
            >
              Write Story
            </Button>
            <Button
              mode="outlined"
              icon="book-open-variant"
              onPress={() => navigation.navigate('Library')}
              style={styles.actionButton}
            >
              My Library
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
    elevation: 0,
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  
  // Welcome Section - Wattpad Style
  welcomeSection: {
    margin: 16,
    marginBottom: 24,
  },
  welcomeGradient: {
    backgroundColor: '#667eea',
    padding: 24,
    borderRadius: 16,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#e8eaf6',
    marginBottom: 20,
  },
  
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Section Styling
  section: {
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Story Cards - Enhanced Wattpad Style
  horizontalList: {
    paddingHorizontal: 16,
  },
  storyCard: {
    width: 280,
    marginRight: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storyAvatar: {
    backgroundColor: '#ff6b35',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  storyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  storyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genreChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
  },
  storyStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default HomeScreen;