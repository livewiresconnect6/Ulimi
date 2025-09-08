import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Title,
  Paragraph,
  Button,
  Surface,
  Card,
  Chip,
  Text,
  IconButton,
  FAB,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

interface Author {
  id: number;
  displayName: string;
  username: string;
  bio?: string;
  photoURL?: string;
  followersCount: number;
  storiesCount: number;
  totalReads: number;
  isFollowing?: boolean;
}

interface Story {
  id: number;
  title: string;
  description: string;
  genre: string;
  readCount: number;
  likeCount: number;
  estimatedReadTime: number;
  publishedAt: string;
}

const AuthorScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [author, setAuthor] = useState<Author | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedTab, setSelectedTab] = useState('stories');

  const authorId = route.params?.id;

  useEffect(() => {
    if (authorId) {
      loadAuthorData();
    }
  }, [authorId]);

  const loadAuthorData = async () => {
    try {
      // Load author profile
      const authorResponse = await fetch(`http://10.0.2.2:5000/api/authors/${authorId}`);
      const authorData = await authorResponse.json();
      setAuthor(authorData);

      // Load author's stories
      const storiesResponse = await fetch(`http://10.0.2.2:5000/api/authors/${authorId}/stories`);
      const storiesData = await storiesResponse.json();
      setStories(storiesData);
    } catch (error) {
      console.error('Error loading author data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAuthorData();
  };

  const handleFollow = async () => {
    if (!user || !author) return;

    try {
      const response = await fetch(`http://10.0.2.2:5000/api/authors/${author.id}/follow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setAuthor(prev => prev ? {
          ...prev,
          isFollowing: !prev.isFollowing,
          followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error following author:', error);
    }
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Read', { id: item.id })}>
      <Card style={styles.storyCard}>
        <Card.Content>
          <Title style={styles.storyTitle} numberOfLines={2}>
            {item.title}
          </Title>
          
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
          
          <Text style={styles.publishDate}>
            Published {new Date(item.publishedAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading || !author) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Loading author profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const followAuthor = async () => {
    if (!user || !author) return;
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`http://10.0.2.2:5000/api/users/${user.id}/following`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: author.id }),
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
        setAuthor(prev => prev ? {
          ...prev,
          followersCount: isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error following author:', error);
    }
  };

  const likeAuthor = async () => {
    if (!user || !author) return;
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/authors/${author.id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.error('Error liking author:', error);
    }
  };

  const favoriteAuthor = async () => {
    if (!user || !author) return;
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/users/${user.id}/author-favorites`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorId: author.id }),
      });
      if (response.ok) {
        setIsFavorited(!isFavorited);
      }
    } catch (error) {
      console.error('Error favoriting author:', error);
    }
  };

  const renderHeader = () => (
    <View style={styles.profileSection}>
      {/* Gradient Background Header */}
      <View style={styles.gradientHeader}>
        <View style={styles.authorInfo}>
          <Avatar.Image 
            source={{ uri: author.photoURL || 'https://via.placeholder.com/150' }} 
            size={120}
            style={styles.authorAvatar}
          />
          <View style={styles.authorDetails}>
            <Title style={styles.authorName}>{author.displayName}</Title>
            <Text style={styles.authorUsername}>@{author.username}</Text>
            <Text style={styles.authorBio}>{author.bio || 'Passionate storyteller sharing amazing adventures!'}</Text>
          </View>
        </View>

        {/* Author Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{author.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{author.storiesCount}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{author.totalReads}</Text>
            <Text style={styles.statLabel}>Total Reads</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode={isFollowing ? "outlined" : "contained"}
            onPress={followAuthor}
            style={[styles.actionButton, isFollowing ? styles.followingButton : styles.followButton]}
            labelStyle={styles.actionButtonText}
            icon={isFollowing ? "account-check" : "account-plus"}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
          
          <IconButton
            icon={isLiked ? "heart" : "heart-outline"}
            iconColor={isLiked ? "#e91e63" : "#666"}
            size={24}
            onPress={likeAuthor}
            style={styles.iconButton}
          />
          
          <IconButton
            icon={isFavorited ? "star" : "star-outline"}
            iconColor={isFavorited ? "#ff9800" : "#666"}
            size={24}
            onPress={favoriteAuthor}
            style={styles.iconButton}
          />
          
          <IconButton
            icon="share-variant"
            iconColor="#666"
            size={24}
            onPress={() => {/* Share author */}}
            style={styles.iconButton}
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'stories' && styles.activeTab]}
          onPress={() => setSelectedTab('stories')}
        >
          <Text style={[styles.tabText, selectedTab === 'stories' && styles.activeTabText]}>
            Stories ({stories.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'about' && styles.activeTab]}
          onPress={() => setSelectedTab('about')}
        >
          <Text style={[styles.tabText, selectedTab === 'about' && styles.activeTabText]}>
            About
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.aboutSection}>
      <Surface style={styles.aboutCard}>
        <Title style={styles.aboutTitle}>About {author.displayName}</Title>
        <Paragraph style={styles.aboutText}>
          {author.bio || `${author.displayName} is a passionate storyteller who loves to create engaging content for readers of all ages. Their stories transport you to magical worlds full of adventure, wonder, and unforgettable characters.`}
        </Paragraph>
        
        <View style={styles.achievementSection}>
          <Text style={styles.achievementTitle}>Writing Journey</Text>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>📚 {author.storiesCount} Stories Published</Text>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>👥 {author.followersCount} Loyal Readers</Text>
          </View>
          <View style={styles.achievementItem}>
            <Text style={styles.achievementText}>👁 {author.totalReads} Total Story Views</Text>
          </View>
        </View>
      </Surface>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
        <Appbar.Content title={author.displayName} titleStyle={styles.headerTitle} />
        <Appbar.Action icon="dots-vertical" color="#fff" onPress={() => {/* More options */}} />
      </Appbar.Header>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        style={styles.scrollView}
      >
        {renderHeader()}
        
        {selectedTab === 'stories' ? (
          <View style={styles.storiesSection}>
            {stories.length > 0 ? (
              stories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  onPress={() => navigation.navigate('Read', { id: story.id })}
                >
                  <Card style={styles.storyCard}>
                    <Card.Content>
                      <View style={styles.storyHeader}>
                        <Title style={styles.storyTitle} numberOfLines={2}>
                          {story.title}
                        </Title>
                        <Chip mode="flat" style={styles.genreChip} textStyle={styles.genreText}>
                          {story.genre}
                        </Chip>
                      </View>
                      
                      <Paragraph numberOfLines={3} style={styles.storyDescription}>
                        {story.description}
                      </Paragraph>
                      
                      <View style={styles.storyStats}>
                        <View style={styles.statGroup}>
                          <Text style={styles.statIcon}>👁</Text>
                          <Text style={styles.statValue}>{story.readCount}</Text>
                        </View>
                        <View style={styles.statGroup}>
                          <Text style={styles.statIcon}>❤️</Text>
                          <Text style={styles.statValue}>{story.likeCount}</Text>
                        </View>
                        <View style={styles.statGroup}>
                          <Text style={styles.statIcon}>⏱</Text>
                          <Text style={styles.statValue}>{story.estimatedReadTime}m</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.publishDate}>
                        Published {new Date(story.publishedAt).toLocaleDateString()}
                      </Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))
            ) : (
              <Surface style={styles.emptyState}>
                <Text style={styles.emptyStateText}>📖 No stories published yet</Text>
                <Text style={styles.emptyStateSubtext}>Check back soon for new stories!</Text>
              </Surface>
            )}
          </View>
        ) : (
          renderAboutTab()
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  
  // Profile Section Styles
  profileSection: {
    marginBottom: 16,
  },
  gradientHeader: {
    backgroundColor: '#667eea',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  authorAvatar: {
    marginRight: 16,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  authorUsername: {
    fontSize: 16,
    color: '#e8eaf6',
    marginBottom: 8,
  },
  authorBio: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#e8eaf6',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginRight: 12,
  },
  followButton: {
    backgroundColor: '#4caf50',
  },
  followingButton: {
    borderColor: '#ffffff',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 4,
  },
  
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  
  // Stories Section
  storiesSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  storyCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  genreChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
  },
  genreText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: 'bold',
  },
  storyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statIcon: {
    marginRight: 4,
    fontSize: 14,
  },
  statValue: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  publishDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  
  // About Section
  aboutSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  aboutCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  achievementSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  achievementItem: {
    paddingVertical: 8,
  },
  achievementText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default AuthorScreen;