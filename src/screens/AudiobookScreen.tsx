import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Appbar,
  Surface,
  Title,
  Paragraph,
  IconButton,
  Button,
  Slider,
  Text,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import Tts from 'react-native-tts';

const { width } = Dimensions.get('window');

interface Story {
  id: number;
  title: string;
  author?: {
    displayName: string;
  };
  chapters: Array<{
    id: number;
    title: string;
    content: string;
  }>;
}

const AudiobookScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [story, setStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);

  const storyId = route.params?.id;

  useEffect(() => {
    if (storyId) {
      loadStory();
    }

    // Initialize TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(playbackRate);
    Tts.setDefaultPitch(1.0);

    // Setup TTS listeners
    Tts.addEventListener('tts-start', onTtsStart);
    Tts.addEventListener('tts-progress', onTtsProgress);
    Tts.addEventListener('tts-finish', onTtsFinish);
    Tts.addEventListener('tts-cancel', onTtsCancel);

    return () => {
      Tts.removeEventListener('tts-start', onTtsStart);
      Tts.removeEventListener('tts-progress', onTtsProgress);
      Tts.removeEventListener('tts-finish', onTtsFinish);
      Tts.removeEventListener('tts-cancel', onTtsCancel);
      Tts.stop();
    };
  }, [storyId, playbackRate]);

  const loadStory = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/stories/${storyId}`);
      const storyData = await response.json();
      setStory(storyData);
      
      // Estimate duration based on word count
      if (storyData.chapters[currentChapter]) {
        const wordCount = storyData.chapters[currentChapter].content.split(' ').length;
        const estimatedDuration = (wordCount / 150) * 60; // 150 words per minute average
        setDuration(estimatedDuration);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load audiobook');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onTtsStart = () => {
    setIsPlaying(true);
  };

  const onTtsProgress = (event: any) => {
    setCurrentPosition(event.location);
  };

  const onTtsFinish = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
    
    // Auto-play next chapter if available
    if (story && currentChapter < story.chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const onTtsCancel = () => {
    setIsPlaying(false);
  };

  const togglePlayback = async () => {
    if (!story?.chapters[currentChapter]) return;

    try {
      if (isPlaying) {
        await Tts.stop();
      } else {
        const content = story.chapters[currentChapter].content;
        await Tts.speak(content);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to control audio playback');
    }
  };

  const skipToNext = () => {
    if (story && currentChapter < story.chapters.length - 1) {
      Tts.stop();
      setCurrentChapter(currentChapter + 1);
      setCurrentPosition(0);
    }
  };

  const skipToPrevious = () => {
    if (currentChapter > 0) {
      Tts.stop();
      setCurrentChapter(currentChapter - 1);
      setCurrentPosition(0);
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    Tts.setDefaultRate(rate);
    
    // If currently playing, restart with new rate
    if (isPlaying && story?.chapters[currentChapter]) {
      Tts.stop();
      setTimeout(() => {
        Tts.speak(story.chapters[currentChapter].content);
      }, 100);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !story) {
    return (
      <SafeAreaView style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Loading audiobook...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentChapterData = story.chapters[currentChapter];

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Audiobook" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="book-open-variant" 
          onPress={() => navigation.navigate('Read', { id: storyId })}
        />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Album Art / Story Cover */}
        <Surface style={styles.coverContainer}>
          <View style={styles.coverArt}>
            <Text style={styles.coverEmoji}>📚</Text>
          </View>
        </Surface>

        {/* Story Info */}
        <View style={styles.storyInfo}>
          <Title style={styles.storyTitle}>{story.title}</Title>
          <Paragraph style={styles.authorName}>
            by {story.author?.displayName || 'Anonymous'}
          </Paragraph>
          <Paragraph style={styles.chapterInfo}>
            Chapter {currentChapter + 1}: {currentChapterData?.title}
          </Paragraph>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.progressSlider}
            value={currentPosition}
            maximumValue={duration}
            minimumValue={0}
            thumbColor="#ff6b35"
            minimumTrackTintColor="#ff6b35"
            maximumTrackTintColor="#e0e0e0"
            onValueChange={(value) => setCurrentPosition(value)}
          />
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Playback Controls */}
        <View style={styles.controls}>
          <IconButton
            icon="skip-previous"
            size={32}
            onPress={skipToPrevious}
            disabled={currentChapter === 0}
          />
          
          <IconButton
            icon="rewind-10"
            size={28}
            onPress={() => {
              const newPosition = Math.max(0, currentPosition - 10);
              setCurrentPosition(newPosition);
            }}
          />
          
          <Surface style={styles.playButtonContainer}>
            <IconButton
              icon={isPlaying ? "pause" : "play"}
              size={40}
              iconColor="#ffffff"
              onPress={togglePlayback}
              style={styles.playButton}
            />
          </Surface>
          
          <IconButton
            icon="fast-forward-10"
            size={28}
            onPress={() => {
              const newPosition = Math.min(duration, currentPosition + 10);
              setCurrentPosition(newPosition);
            }}
          />
          
          <IconButton
            icon="skip-next"
            size={32}
            onPress={skipToNext}
            disabled={currentChapter === story.chapters.length - 1}
          />
        </View>

        {/* Speed Control */}
        <Surface style={styles.speedControl}>
          <Text style={styles.speedLabel}>Playback Speed</Text>
          <View style={styles.speedButtons}>
            {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
              <Button
                key={speed}
                mode={playbackRate === speed ? "contained" : "outlined"}
                compact
                onPress={() => changePlaybackRate(speed)}
                style={styles.speedButton}
              >
                {speed}x
              </Button>
            ))}
          </View>
        </Surface>

        {/* Chapter List */}
        {story.chapters.length > 1 && (
          <Surface style={styles.chapterList}>
            <Text style={styles.chapterListTitle}>Chapters ({story.chapters.length})</Text>
            <View style={styles.chapterButtons}>
              <Button
                mode="outlined"
                disabled={currentChapter === 0}
                onPress={skipToPrevious}
                style={styles.chapterNavButton}
              >
                Previous Chapter
              </Button>
              <Button
                mode="outlined"
                disabled={currentChapter === story.chapters.length - 1}
                onPress={skipToNext}
                style={styles.chapterNavButton}
              >
                Next Chapter
              </Button>
            </View>
          </Surface>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  coverContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  coverArt: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverEmoji: {
    fontSize: 80,
  },
  storyInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  chapterInfo: {
    fontSize: 14,
    color: '#999',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  playButtonContainer: {
    borderRadius: 35,
    backgroundColor: '#ff6b35',
    marginHorizontal: 20,
    elevation: 4,
  },
  playButton: {
    margin: 0,
  },
  speedControl: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  speedLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  speedButton: {
    minWidth: 50,
  },
  chapterList: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chapterListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  chapterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chapterNavButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default AudiobookScreen;