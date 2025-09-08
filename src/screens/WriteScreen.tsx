import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {
  Appbar,
  TextInput,
  Button,
  Surface,
  Title,
  Paragraph,
  Chip,
  Menu,
  Divider,
  Text,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
// Note: These imports would need proper React Native packages installed
// import ImageUploadModal from '../components/ImageUploadModal';
// import AudioUploadModal from '../components/AudioUploadModal';

interface Chapter {
  title: string;
  content: string;
  wordCount: number;
}

const WriteScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Fiction');
  const [language, setLanguage] = useState('en');
  const [chapters, setChapters] = useState<Chapter[]>([
    { title: 'Chapter 1', content: '', wordCount: 0 }
  ]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [genreMenuVisible, setGenreMenuVisible] = useState(false);
  const [languageMenuVisible, setLanguageMenuVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<any>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [audioModalVisible, setAudioModalVisible] = useState(false);

  const genres = [
    'Fiction', 'Children\'s Stories', 'Romance', 'Mystery', 'Thriller', 'Fantasy', 
    'Science Fiction', 'Adventure', 'Drama', 'Comedy', 'Historical'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'sw', name: 'Swahili' },
    { code: 'zh', name: 'Chinese' },
  ];

  useEffect(() => {
    updateWordCount();
  }, [chapters, currentChapter]);

  const updateWordCount = () => {
    const updatedChapters = [...chapters];
    if (updatedChapters[currentChapter]) {
      const wordCount = updatedChapters[currentChapter].content.trim().split(/\s+/).length;
      updatedChapters[currentChapter].wordCount = updatedChapters[currentChapter].content.trim() ? wordCount : 0;
      setChapters(updatedChapters);
    }
  };

  const updateChapterContent = (content: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[currentChapter].content = content;
    setChapters(updatedChapters);
  };

  const updateChapterTitle = (chapterTitle: string) => {
    const updatedChapters = [...chapters];
    updatedChapters[currentChapter].title = chapterTitle;
    setChapters(updatedChapters);
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      title: `Chapter ${chapters.length + 1}`,
      content: '',
      wordCount: 0
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapter(chapters.length);
  };

  const removeChapter = () => {
    if (chapters.length <= 1) {
      Alert.alert('Error', 'A story must have at least one chapter');
      return;
    }

    Alert.alert(
      'Remove Chapter',
      'Are you sure you want to remove this chapter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updatedChapters = chapters.filter((_, index) => index !== currentChapter);
            setChapters(updatedChapters);
            setCurrentChapter(Math.max(0, currentChapter - 1));
          }
        }
      ]
    );
  };

  const saveDraft = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a story title');
      return;
    }

    if (!chapters[0]?.content.trim()) {
      Alert.alert('Error', 'Please write some content');
      return;
    }

    setSaving(true);
    try {
      const storyData = {
        title: title.trim(),
        description: description.trim(),
        genre,
        language,
        authorId: user?.id,
        chapters: chapters.filter(ch => ch.content.trim()),
        isDraft: true,
        isPublished: false,
      };

      const response = await fetch('http://10.0.2.2:5000/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Draft saved successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to save draft');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const publishStory = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    if (!chapters[0]?.content.trim()) {
      Alert.alert('Error', 'Please write some content');
      return;
    }

    Alert.alert(
      'Publish Story',
      'Are you ready to publish your story? It will be visible to all users.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            setSaving(true);
            try {
              const storyData = {
                title: title.trim(),
                description: description.trim(),
                genre,
                language,
                authorId: user?.id,
                chapters: chapters.filter(ch => ch.content.trim()),
                isDraft: false,
        isPublished: true,
              };

              const response = await fetch('http://10.0.2.2:5000/api/stories', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(storyData),
              });

              if (response.ok) {
                Alert.alert('Success', 'Story published successfully!');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to publish story');
              }
            } catch (error) {
              Alert.alert('Error', 'Network error. Please try again.');
            } finally {
              setSaving(false);
            }
          }
        }
      ]
    );
  };

  const currentChapterData = chapters[currentChapter] || { title: '', content: '', wordCount: 0 };
  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} iconColor="#fff" />
        <Appbar.Content title="✍️ Write Story" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="content-save" onPress={saveDraft} iconColor="#fff" />
      </Appbar.Header>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          {/* Story Details */}
          <Surface style={styles.storyDetails}>
            <Title style={styles.sectionTitle}>Story Details</Title>
            
            <TextInput
              label="Story Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              placeholder="Enter your story title..."
            />

            <TextInput
              label="Description *"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Write a brief description of your story..."
            />

            {/* Cover Image Upload */}
            <View style={styles.mediaSection}>
              <Text style={styles.metaLabel}>Cover Image (Optional)</Text>
              <Text style={styles.sizeWarning}>📸 Max size: 2MB</Text>
              <View style={styles.mediaUploadRow}>
                {coverImage ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: coverImage }} style={styles.previewImage} />
                    <IconButton 
                      icon="close-circle" 
                      size={24}
                      onPress={() => setCoverImage(null)}
                      style={styles.removeImageButton}
                    />
                  </View>
                ) : (
                  <Button 
                    mode="outlined" 
                    icon="camera"
                    onPress={() => setImageModalVisible(true)}
                    style={styles.uploadButton}
                  >
                    Add Cover Image
                  </Button>
                )}
              </View>
            </View>

            {/* Audio Upload */}
            <View style={styles.mediaSection}>
              <Text style={styles.metaLabel}>Audio Narration (Optional)</Text>
              <Text style={styles.sizeWarning}>🎵 Max size: 25MB • 30min duration</Text>
              <View style={styles.mediaUploadRow}>
                {audioFile ? (
                  <View style={styles.audioPreview}>
                    <Text style={styles.audioFileName}>{audioFile.name}</Text>
                    <Text style={styles.audioFileSize}>{audioFile.sizeFormatted}</Text>
                    <IconButton 
                      icon="close-circle" 
                      size={20}
                      onPress={() => setAudioFile(null)}
                    />
                  </View>
                ) : (
                  <Button 
                    mode="outlined" 
                    icon="microphone"
                    onPress={() => setAudioModalVisible(true)}
                    style={styles.uploadButton}
                  >
                    Add Audio
                  </Button>
                )}
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Genre</Text>
                <Menu
                  visible={genreMenuVisible}
                  onDismiss={() => setGenreMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setGenreMenuVisible(true)}
                      style={styles.metaButton}
                    >
                      {genre}
                    </Button>
                  }
                >
                  {genres.map((g) => (
                    <Menu.Item
                      key={g}
                      title={g}
                      onPress={() => {
                        setGenre(g);
                        setGenreMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
              </View>

              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Language</Text>
                <Menu
                  visible={languageMenuVisible}
                  onDismiss={() => setLanguageMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setLanguageMenuVisible(true)}
                      style={styles.metaButton}
                    >
                      {languages.find(l => l.code === language)?.name || 'English'}
                    </Button>
                  }
                >
                  {languages.map((lang) => (
                    <Menu.Item
                      key={lang.code}
                      title={lang.name}
                      onPress={() => {
                        setLanguage(lang.code);
                        setLanguageMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
              </View>
            </View>
          </Surface>

          {/* Chapter Management */}
          <Surface style={styles.chapterManagement}>
            <View style={styles.chapterHeader}>
              <Title style={styles.sectionTitle}>Chapters ({chapters.length})</Title>
              <View style={styles.chapterActions}>
                <Button
                  mode="outlined"
                  compact
                  onPress={addChapter}
                  style={styles.chapterButton}
                >
                  Add Chapter
                </Button>
                {chapters.length > 1 && (
                  <Button
                    mode="outlined"
                    compact
                    onPress={removeChapter}
                    style={styles.chapterButton}
                    textColor="#d32f2f"
                  >
                    Remove
                  </Button>
                )}
              </View>
            </View>

            {/* Chapter Navigation */}
            {chapters.length > 1 && (
              <View style={styles.chapterNav}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {chapters.map((_, index) => (
                    <Chip
                      key={index}
                      mode={currentChapter === index ? "flat" : "outlined"}
                      onPress={() => setCurrentChapter(index)}
                      style={styles.chapterChip}
                    >
                      {index + 1}
                    </Chip>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Current Chapter Editor */}
            <View style={styles.chapterEditor}>
              <TextInput
                label="Chapter Title"
                value={currentChapterData.title}
                onChangeText={updateChapterTitle}
                mode="outlined"
                style={styles.chapterTitleInput}
              />

              <TextInput
                label="Chapter Content"
                value={currentChapterData.content}
                onChangeText={updateChapterContent}
                mode="outlined"
                multiline
                numberOfLines={15}
                style={styles.contentInput}
                placeholder="Start writing your chapter here..."
              />

              <View style={styles.stats}>
                <Text style={styles.statText}>
                  Words in this chapter: {currentChapterData.wordCount}
                </Text>
                <Text style={styles.statText}>
                  Total story words: {totalWords}
                </Text>
              </View>
            </View>
          </Surface>

          {/* Publish Actions */}
          <Surface style={styles.publishActions}>
            <Title style={styles.sectionTitle}>Ready to Share?</Title>
            <Paragraph style={styles.publishDescription}>
              Save as draft to continue later, or publish to share with readers worldwide.
            </Paragraph>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={saveDraft}
                loading={saving}
                disabled={saving}
                style={styles.actionButton}
              >
                Save Draft
              </Button>
              <Button
                mode="contained"
                onPress={publishStory}
                loading={saving}
                disabled={saving}
                style={styles.actionButton}
              >
                Publish Story
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  storyDetails: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  chapterManagement: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  publishActions: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaButton: {
    justifyContent: 'flex-start',
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chapterActions: {
    flexDirection: 'row',
    gap: 8,
  },
  chapterButton: {
    minWidth: 80,
  },
  chapterNav: {
    marginBottom: 16,
  },
  chapterChip: {
    marginRight: 8,
  },
  chapterEditor: {
    flex: 1,
  },
  chapterTitleInput: {
    marginBottom: 16,
  },
  contentInput: {
    marginBottom: 16,
    minHeight: 200,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  publishDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  mediaSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sizeWarning: {
    fontSize: 12,
    color: '#f57c00',
    marginBottom: 8,
    fontWeight: '500',
  },
  mediaUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadButton: {
    marginRight: 8,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  audioPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8,
    flex: 1,
  },
  audioFileName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  audioFileSize: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
});

export default WriteScreen;