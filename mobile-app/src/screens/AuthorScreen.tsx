import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Avatar, Card, Button, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const AuthorScreen = ({ navigation }: any) => {
  const authorStories = [
    {
      id: 1,
      title: "The Girl Who Spoke to Stars",
      genre: "Fantasy",
      readCount: 178,
      description: "A mystical tale of Amara, a young girl who discovers her ability to communicate with celestial beings.",
    },
    {
      id: 2,
      title: "Ubuntu: The Village That Learned to Share",
      genre: "Cultural",
      readCount: 156,
      description: "A heartwarming story about how the African philosophy of Ubuntu transformed a divided community.",
    },
    {
      id: 3,
      title: "The Digital Divide",
      genre: "Contemporary",
      readCount: 89,
      description: "Young Kwame's journey to bring internet to his rural village.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Author Profile</Text>
        <TouchableOpacity>
          <MaterialIcons name="share" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.authorHeader}>
          <Avatar.Text size={100} label="ND" style={styles.avatar} />
          <Text style={styles.authorName}>Nomsa Dlamini</Text>
          <Text style={styles.authorTitle}>Storyteller & Cultural Preservationist</Text>
          <Text style={styles.authorBio}>
            Nomsa Dlamini is a celebrated author dedicated to preserving and sharing African stories. 
            Her work focuses on cultural heritage, Ubuntu philosophy, and the power of storytelling 
            to connect communities across generations.
          </Text>
          
          <View style={styles.authorStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.4K</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>423</Text>
              <Text style={styles.statLabel}>Total Reads</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              style={styles.followButton}
              onPress={() => {}}
            >
              Follow
            </Button>
            <Button
              mode="outlined"
              style={styles.messageButton}
              onPress={() => {}}
            >
              Message
            </Button>
          </View>
        </View>

        <View style={styles.storiesSection}>
          <Text style={styles.sectionTitle}>Published Stories</Text>
          {authorStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => navigation.navigate('Read', { storyId: story.id })}
            >
              <Card style={styles.storyCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.storyInfo}>
                      <Text style={styles.storyTitle}>{story.title}</Text>
                      <Text style={styles.storyDescription} numberOfLines={2}>
                        {story.description}
                      </Text>
                    </View>
                    <Chip mode="outlined" compact>{story.genre}</Chip>
                  </View>
                  <View style={styles.cardFooter}>
                    <View style={styles.readCount}>
                      <MaterialIcons name="visibility" size={16} color="#666" />
                      <Text style={styles.readCountText}>{story.readCount} reads</Text>
                    </View>
                    <View style={styles.storyActions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('Audiobook', { storyId: story.id })}
                        style={styles.actionButton}
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

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Card style={styles.achievementCard}>
            <Card.Content>
              <View style={styles.achievement}>
                <MaterialIcons name="star" size={24} color="#fbbf24" />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Featured Author</Text>
                  <Text style={styles.achievementDesc}>Recognized for outstanding storytelling</Text>
                </View>
              </View>
              <View style={styles.achievement}>
                <MaterialIcons name="favorite" size={24} color="#ef4444" />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Community Favorite</Text>
                  <Text style={styles.achievementDesc}>Stories loved by 1,000+ readers</Text>
                </View>
              </View>
              <View style={styles.achievement}>
                <MaterialIcons name="library-books" size={24} color="#6366f1" />
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>Cultural Contributor</Text>
                  <Text style={styles.achievementDesc}>Preserving African heritage through stories</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
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
    padding: 16,
  },
  authorHeader: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  avatar: {
    backgroundColor: '#6366f1',
    marginBottom: 16,
  },
  authorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  authorTitle: {
    fontSize: 16,
    color: '#6366f1',
    marginBottom: 16,
  },
  authorBio: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  authorStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    backgroundColor: '#6366f1',
  },
  messageButton: {
    borderColor: '#6366f1',
  },
  storiesSection: {
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
    marginRight: 12,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  storyDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
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
  storyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementCard: {
    elevation: 2,
    borderRadius: 12,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementInfo: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});

export default AuthorScreen;