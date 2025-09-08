import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const LibraryScreen = ({ navigation }: any) => {
  const libraryStories = [
    {
      id: 1,
      title: "The Girl Who Spoke to Stars",
      author: "Nomsa Dlamini",
      genre: "Fantasy",
      progress: 85,
      lastRead: "2 days ago",
    },
    {
      id: 2,
      title: "Ubuntu: The Village That Learned to Share",
      author: "Nomsa Dlamini",
      genre: "Cultural",
      progress: 100,
      lastRead: "1 week ago",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <Text style={styles.headerSubtitle}>Your saved stories and reading progress</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Stories Saved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24h</Text>
            <Text style={styles.statLabel}>Reading Time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Reading</Text>
          {libraryStories.map((story) => (
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
                      <Text style={styles.lastRead}>Last read: {story.lastRead}</Text>
                    </View>
                    <Chip mode="outlined" compact>{story.genre}</Chip>
                  </View>
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${story.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{story.progress}% complete</Text>
                  </View>
                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.continueButton}
                      onPress={() => navigation.navigate('Read', { storyId: story.id })}
                    >
                      <MaterialIcons name="play-arrow" size={20} color="#fff" />
                      <Text style={styles.continueButtonText}>Continue Reading</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Audiobook', { storyId: story.id })}
                    >
                      <MaterialIcons name="headphones" size={24} color="#6366f1" />
                    </TouchableOpacity>
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
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
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    marginBottom: 2,
  },
  lastRead: {
    fontSize: 12,
    color: '#94a3b8',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LibraryScreen;