import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Searchbar, Chip, Card, Title, Paragraph } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const BrowseScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const genres = ['All', 'Fantasy', 'Cultural', 'Contemporary', 'Mystery', 'Romance', 'Adventure'];

  const stories = [
    {
      id: 1,
      title: "The Girl Who Spoke to Stars",
      author: "Nomsa Dlamini",
      genre: "Fantasy",
      readCount: 178,
      description: "A mystical tale of Amara, a young girl who discovers her ability to communicate with celestial beings.",
    },
    {
      id: 2,
      title: "Ubuntu: The Village That Learned to Share",
      author: "Nomsa Dlamini",
      genre: "Cultural",
      readCount: 156,
      description: "A heartwarming story about how the African philosophy of Ubuntu transformed a divided community.",
    },
    {
      id: 3,
      title: "The Digital Divide",
      author: "Nomsa Dlamini",
      genre: "Contemporary",
      readCount: 89,
      description: "Young Kwame's journey to bring internet to his rural village.",
    },
  ];

  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         story.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || story.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Stories</Text>
        <Searchbar
          placeholder="Search stories and authors..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.genreSection}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.genreList}>
              {genres.map((genre) => (
                <Chip
                  key={genre}
                  mode={selectedGenre === genre ? 'flat' : 'outlined'}
                  selected={selectedGenre === genre}
                  onPress={() => setSelectedGenre(genre)}
                  style={styles.genreChip}
                >
                  {genre}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>
            {filteredStories.length} {filteredStories.length === 1 ? 'Story' : 'Stories'} Found
          </Text>
          {filteredStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => navigation.navigate('Read', { storyId: story.id })}
            >
              <Card style={styles.storyCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.storyInfo}>
                      <Title style={styles.storyTitle}>{story.title}</Title>
                      <Text style={styles.authorName}>by {story.author}</Text>
                    </View>
                    <View style={styles.storyMeta}>
                      <Chip mode="outlined" compact style={styles.genreTag}>
                        {story.genre}
                      </Chip>
                    </View>
                  </View>
                  <Paragraph style={styles.storyDescription} numberOfLines={2}>
                    {story.description}
                  </Paragraph>
                  <View style={styles.cardFooter}>
                    <View style={styles.readCount}>
                      <MaterialIcons name="visibility" size={16} color="#666" />
                      <Text style={styles.readCountText}>{story.readCount} reads</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Audiobook', { storyId: story.id })}
                      >
                        <MaterialIcons name="headphones" size={20} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="bookmark-border" size={20} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <MaterialIcons name="favorite-border" size={20} color="#6366f1" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: '#f1f5f9',
    elevation: 0,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  genreSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  genreList: {
    flexDirection: 'row',
    gap: 8,
  },
  genreChip: {
    marginRight: 8,
  },
  resultsSection: {
    flex: 1,
  },
  storyCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    color: '#64748b',
  },
  storyMeta: {
    alignItems: 'flex-end',
  },
  genreTag: {
    marginBottom: 4,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
});

export default BrowseScreen;