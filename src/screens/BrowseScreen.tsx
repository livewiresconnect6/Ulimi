import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Searchbar,
  Chip,
  Avatar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

interface Story {
  id: number;
  title: string;
  description: string;
  genre: string;
  author?: {
    displayName: string;
  };
  readCount: number;
  likeCount: number;
  estimatedReadTime: number;
}

const BrowseScreen: React.FC = () => {
  const navigation = useNavigation();
  const [stories, setStories] = useState<Story[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const response = await fetch('http://10.0.2.2:5000/api/stories');
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStories = async (query: string) => {
    if (!query.trim()) {
      loadStories();
      return;
    }
    
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/stories?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      setStories(data);
    } catch (error) {
      console.error('Error searching stories:', error);
    }
  };

  const renderStoryItem = ({ item }: { item: Story }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Read', { id: item.id })}>
      <Card style={styles.storyCard}>
        <Card.Content>
          <View style={styles.storyHeader}>
            <Avatar.Text 
              size={50} 
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
              <View style={styles.storyMeta}>
                <Chip mode="outlined" compact style={styles.genreChip}>
                  {item.genre}
                </Chip>
              </View>
            </View>
          </View>
          
          <Paragraph numberOfLines={3} style={styles.storyDescription}>
            {item.description}
          </Paragraph>
          
          <View style={styles.storyStats}>
            <Paragraph style={styles.statText}>👁 {item.readCount}</Paragraph>
            <Paragraph style={styles.statText}>❤️ {item.likeCount}</Paragraph>
            <Paragraph style={styles.statText}>⏱ {item.estimatedReadTime}m</Paragraph>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="🔍 Discover Stories" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="filter-variant" iconColor="#fff" onPress={() => {/* Filter */}} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search stories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={() => searchStories(searchQuery)}
          style={styles.searchBar}
        />

        <FlatList
          data={stories}
          renderItem={renderStoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  
  // Search Section
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  
  // Story Cards - Enhanced Design
  storyCard: {
    marginBottom: 16,
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
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
  },
  genreChip: {
    backgroundColor: '#e3f2fd',
    borderRadius: 16,
  },
  storyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default BrowseScreen;