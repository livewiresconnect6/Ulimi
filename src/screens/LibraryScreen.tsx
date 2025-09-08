import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Tabs,
  Avatar,
  Button,
  Surface,
  Text,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

interface LibraryItem {
  id: number;
  title: string;
  description: string;
  author?: {
    displayName: string;
  };
  readingProgress?: number;
  lastRead?: string;
  isFinished?: boolean;
}

const LibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [readingList, setReadingList] = useState<LibraryItem[]>([]);
  const [favorites, setFavorites] = useState<LibraryItem[]>([]);
  const [finished, setFinished] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLibraryContent();
  }, []);

  const loadLibraryContent = async () => {
    if (!user) return;
    
    try {
      // Load reading list
      const readingResponse = await fetch(`http://10.0.2.2:5000/api/users/${user.id}/library`);
      const reading = await readingResponse.json();
      setReadingList(reading.filter((item: LibraryItem) => !item.isFinished));

      // Load favorites
      const favoritesResponse = await fetch(`http://10.0.2.2:5000/api/users/${user.id}/favorites`);
      const favs = await favoritesResponse.json();
      setFavorites(favs);

      // Load finished stories
      setFinished(reading.filter((item: LibraryItem) => item.isFinished));
    } catch (error) {
      console.error('Error loading library:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLibraryContent();
  };

  const renderLibraryItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Read', { id: item.id })}>
      <Card style={styles.libraryCard}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <Avatar.Text 
              size={45} 
              label={item.title.charAt(0).toUpperCase()} 
              style={styles.itemAvatar}
            />
            <View style={styles.itemInfo}>
              <Title style={styles.itemTitle} numberOfLines={2}>
                {item.title}
              </Title>
              <Paragraph style={styles.authorName}>
                by {item.author?.displayName || 'Anonymous'}
              </Paragraph>
              {item.readingProgress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${item.readingProgress}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {item.readingProgress}% complete
                  </Text>
                </View>
              )}
              {item.lastRead && (
                <Text style={styles.lastRead}>
                  Last read: {new Date(item.lastRead).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          
          <Paragraph numberOfLines={2} style={styles.itemDescription}>
            {item.description}
          </Paragraph>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = (message: string) => (
    <Surface style={styles.emptyState}>
      <Text style={styles.emptyTitle}>📚</Text>
      <Title style={styles.emptyText}>{message}</Title>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Browse')}
        style={styles.browseButton}
      >
        Browse Stories
      </Button>
    </Surface>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Reading List
        return readingList.length > 0 ? (
          <FlatList
            data={readingList}
            renderItem={renderLibraryItem}
            keyExtractor={(item) => `reading-${item.id}`}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : renderEmptyState("No stories in your reading list");

      case 1: // Favorites
        return favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderLibraryItem}
            keyExtractor={(item) => `favorite-${item.id}`}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : renderEmptyState("No favorite stories yet");

      case 2: // Finished
        return finished.length > 0 ? (
          <FlatList
            data={finished}
            renderItem={renderLibraryItem}
            keyExtractor={(item) => `finished-${item.id}`}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : renderEmptyState("No finished stories");

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="My Library" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="refresh" 
          onPress={onRefresh}
        />
      </Appbar.Header>

      <Tabs value={activeTab} onValueChange={setActiveTab} style={styles.tabs}>
        <Tabs.Screen value={0} label="Reading" />
        <Tabs.Screen value={1} label="Favorites" />
        <Tabs.Screen value={2} label="Finished" />
      </Tabs>

      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ff6b35',
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tabs: {
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  libraryCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemAvatar: {
    backgroundColor: '#ff6b35',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  lastRead: {
    fontSize: 11,
    color: '#999',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  browseButton: {
    marginTop: 10,
  },
});

export default LibraryScreen;