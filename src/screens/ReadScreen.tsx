import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Appbar,
  Surface,
  Title,
  Paragraph,
  Button,
  IconButton,
  Menu,
  Divider,
  Chip,
  Text,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

interface Chapter {
  id: number;
  title: string;
  content: string;
  wordCount: number;
  estimatedReadTime: number;
}

interface Story {
  id: number;
  title: string;
  description: string;
  genre: string;
  language: string;
  author?: {
    id: number;
    displayName: string;
    photoURL?: string;
  };
  chapters: Chapter[];
  readCount: number;
  likeCount: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  isInLibrary?: boolean;
}

const ReadScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [fontMenuVisible, setFontMenuVisible] = useState(false);
  const [translationMenuVisible, setTranslationMenuVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translatedContent, setTranslatedContent] = useState('');
  const [loading, setLoading] = useState(true);

  const storyId = route.params?.id;

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  const loadStory = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/stories/${storyId}`);
      const storyData = await response.json();
      setStory(storyData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load story');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !story) return;

    try {
      const response = await fetch(`http://10.0.2.2:5000/api/stories/${story.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setStory(prev => prev ? {
          ...prev,
          isLiked: !prev.isLiked,
          likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        } : null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleFavorite = async () => {
    if (!user || !story) return;

    try {
      const response = await fetch(`http://10.0.2.2:5000/api/stories/${story.id}/favorite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        setStory(prev => prev ? {
          ...prev,
          isFavorited: !prev.isFavorited
        } : null);
        Alert.alert('Success', story.isFavorited ? 'Removed from favorites' : 'Added to favorites');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleAddToLibrary = async () => {
    if (!user || !story) return;

    try {
      const response = await fetch(`http://10.0.2.2:5000/api/users/${user.id}/library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: story.id }),
      });

      if (response.ok) {
        setStory(prev => prev ? { ...prev, isInLibrary: true } : null);
        Alert.alert('Success', 'Added to your library');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add to library');
    }
  };

  const handleTranslate = async (targetLanguage: string) => {
    if (!story?.chapters[currentChapter]) return;

    try {
      setCurrentLanguage(targetLanguage);
      const response = await fetch(`http://10.0.2.2:5000/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: story.chapters[currentChapter].content,
          targetLanguage,
        }),
      });

      const data = await response.json();
      setTranslatedContent(data.translatedText);
    } catch (error) {
      Alert.alert('Error', 'Translation failed');
    }
  };

  const navigateToAudiobook = () => {
    navigation.navigate('Audiobook', { id: storyId });
  };

  if (loading || !story) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Loading story...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentChapterData = story.chapters[currentChapter];
  const displayContent = translatedContent || currentChapterData?.content || '';

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={story.title} titleStyle={styles.headerTitle} />
        
        <Menu
          visible={fontMenuVisible}
          onDismiss={() => setFontMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="format-size" 
              onPress={() => setFontMenuVisible(true)} 
            />
          }
        >
          <Menu.Item title="Small" onPress={() => { setFontSize(14); setFontMenuVisible(false); }} />
          <Menu.Item title="Medium" onPress={() => { setFontSize(16); setFontMenuVisible(false); }} />
          <Menu.Item title="Large" onPress={() => { setFontSize(18); setFontMenuVisible(false); }} />
          <Menu.Item title="Extra Large" onPress={() => { setFontSize(20); setFontMenuVisible(false); }} />
        </Menu>

        <Menu
          visible={translationMenuVisible}
          onDismiss={() => setTranslationMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="translate" 
              onPress={() => setTranslationMenuVisible(true)} 
            />
          }
        >
          <Menu.Item title="English" onPress={() => { handleTranslate('en'); setTranslationMenuVisible(false); }} />
          <Menu.Item title="Spanish" onPress={() => { handleTranslate('es'); setTranslationMenuVisible(false); }} />
          <Menu.Item title="French" onPress={() => { handleTranslate('fr'); setTranslationMenuVisible(false); }} />
          <Menu.Item title="Swahili" onPress={() => { handleTranslate('sw'); setTranslationMenuVisible(false); }} />
          <Menu.Item title="Chinese" onPress={() => { handleTranslate('zh'); setTranslationMenuVisible(false); }} />
          <Divider />
          <Menu.Item title="Original" onPress={() => { setTranslatedContent(''); setCurrentLanguage(story.language); setTranslationMenuVisible(false); }} />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Story Info */}
        <Surface style={styles.storyInfo}>
          <View style={styles.storyHeader}>
            <View style={styles.storyMeta}>
              <Title style={styles.storyTitle}>{story.title}</Title>
              <Paragraph style={styles.authorName}>
                by {story.author?.displayName || 'Anonymous'}
              </Paragraph>
              <View style={styles.metaTags}>
                <Chip mode="outlined" compact style={styles.genreChip}>
                  {story.genre}
                </Chip>
                <Chip mode="outlined" compact style={styles.languageChip}>
                  {currentLanguage === story.language ? 'Original' : `Translated to ${currentLanguage.toUpperCase()}`}
                </Chip>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              icon="play"
              onPress={navigateToAudiobook}
              style={styles.audioButton}
            >
              Listen
            </Button>
            <IconButton
              icon={story.isLiked ? "heart" : "heart-outline"}
              iconColor={story.isLiked ? "#d32f2f" : "#666"}
              onPress={handleLike}
            />
            <IconButton
              icon={story.isFavorited ? "star" : "star-outline"}
              iconColor={story.isFavorited ? "#ff6b35" : "#666"}
              onPress={handleFavorite}
            />
            <IconButton
              icon={story.isInLibrary ? "bookmark" : "bookmark-outline"}
              iconColor={story.isInLibrary ? "#ff6b35" : "#666"}
              onPress={handleAddToLibrary}
            />
          </View>
        </Surface>

        {/* Chapter Navigation */}
        {story.chapters.length > 1 && (
          <Surface style={styles.chapterNav}>
            <Title style={styles.chapterTitle}>
              Chapter {currentChapter + 1}: {currentChapterData?.title}
            </Title>
            <View style={styles.chapterButtons}>
              <Button
                mode="outlined"
                disabled={currentChapter === 0}
                onPress={() => setCurrentChapter(currentChapter - 1)}
              >
                Previous
              </Button>
              <Text style={styles.chapterCounter}>
                {currentChapter + 1} of {story.chapters.length}
              </Text>
              <Button
                mode="outlined"
                disabled={currentChapter === story.chapters.length - 1}
                onPress={() => setCurrentChapter(currentChapter + 1)}
              >
                Next
              </Button>
            </View>
          </Surface>
        )}

        {/* Story Content */}
        <Surface style={styles.contentContainer}>
          <Text style={[styles.content, { fontSize }]}>
            {displayContent}
          </Text>
        </Surface>

        {/* Reading Progress */}
        <Surface style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              📊 {currentChapterData?.wordCount} words • ⏱ {currentChapterData?.estimatedReadTime} min read
            </Text>
            <Text style={styles.progressText}>
              👁 {story.readCount} reads • ❤️ {story.likeCount} likes
            </Text>
          </View>
        </Surface>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  storyInfo: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  storyHeader: {
    marginBottom: 16,
  },
  storyMeta: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  metaTags: {
    flexDirection: 'row',
    gap: 8,
  },
  genreChip: {
    height: 32,
  },
  languageChip: {
    height: 32,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  audioButton: {
    flex: 1,
    marginRight: 12,
  },
  chapterNav: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chapterTitle: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  chapterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterCounter: {
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  content: {
    lineHeight: 28,
    color: '#333',
    textAlign: 'justify',
  },
  progressContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    marginBottom: 32,
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

export default ReadScreen;