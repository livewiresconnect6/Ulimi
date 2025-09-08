import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Slider,
} from 'react-native';
import { Card, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AudiobookScreen = ({ navigation }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const playbackSpeeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audio Player</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Read')}>
          <MaterialIcons name="article" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Card style={styles.storyCard}>
          <Card.Content style={styles.storyInfo}>
            <View style={styles.coverArt}>
              <MaterialIcons name="auto-stories" size={80} color="#6366f1" />
            </View>
            <Text style={styles.storyTitle}>The Girl Who Spoke to Stars</Text>
            <Text style={styles.storyAuthor}>by Nomsa Dlamini</Text>
            <Chip mode="outlined" style={styles.genreChip}>Fantasy</Chip>
          </Card.Content>
        </Card>

        <View style={styles.playerControls}>
          <View style={styles.progressContainer}>
            <Slider
              style={styles.progressSlider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onValueChange={setCurrentTime}
              minimumTrackTintColor="#6366f1"
              maximumTrackTintColor="#e2e8f0"
              thumbStyle={styles.sliderThumb}
            />
            <View style={styles.timeLabels}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>

          <View style={styles.mainControls}>
            <TouchableOpacity style={styles.controlButton}>
              <MaterialIcons name="skip-previous" size={36} color="#6366f1" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={48}
                color="#fff"
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <MaterialIcons name="skip-next" size={36} color="#6366f1" />
            </TouchableOpacity>
          </View>

          <View style={styles.additionalControls}>
            <TouchableOpacity style={styles.smallControlButton}>
              <MaterialIcons name="replay-10" size={24} color="#64748b" />
            </TouchableOpacity>
            
            <View style={styles.speedControl}>
              <Text style={styles.speedLabel}>Speed</Text>
              <View style={styles.speedButtons}>
                {playbackSpeeds.map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedButton,
                      playbackSpeed === speed && styles.speedButtonActive
                    ]}
                    onPress={() => setPlaybackSpeed(speed)}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      playbackSpeed === speed && styles.speedButtonTextActive
                    ]}>
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={styles.smallControlButton}>
              <MaterialIcons name="forward-30" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="download" size={24} color="#6366f1" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="bookmark-border" size={24} color="#6366f1" />
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="share" size={24} color="#6366f1" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  storyCard: {
    elevation: 4,
    borderRadius: 16,
    marginBottom: 32,
  },
  storyInfo: {
    alignItems: 'center',
    padding: 24,
  },
  coverArt: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  storyAuthor: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  genreChip: {
    marginTop: 8,
  },
  playerControls: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressSlider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#6366f1',
    width: 20,
    height: 20,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#64748b',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    backgroundColor: '#6366f1',
    borderRadius: 40,
    padding: 16,
  },
  additionalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallControlButton: {
    padding: 8,
  },
  speedControl: {
    alignItems: 'center',
  },
  speedLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  speedButtonActive: {
    backgroundColor: '#6366f1',
  },
  speedButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  speedButtonTextActive: {
    color: '#fff',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
});

export default AudiobookScreen;