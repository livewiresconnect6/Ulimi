import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Title,
  Paragraph,
  Button,
  Surface,
  Divider,
  List,
  Switch,
  TextInput,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: logout,
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`http://10.0.2.2:5000/api/users/${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          bio,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully!');
        setEditingProfile(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const StatsCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
    <Surface style={styles.statCard}>
      <Title style={styles.statValue}>{value}</Title>
      <Paragraph style={styles.statTitle}>{title}</Paragraph>
      <Paragraph style={styles.statSubtitle}>{subtitle}</Paragraph>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="👤 My Profile" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon="cog" 
          onPress={() => {/* Settings action */}}
          iconColor="#fff"
        />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <Surface style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user?.displayName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
            style={styles.avatar}
          />
          
          {editingProfile ? (
            <View style={styles.editForm}>
              <TextInput
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                mode="outlined"
                style={styles.editInput}
              />
              <TextInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.editInput}
              />
              <View style={styles.editActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setEditingProfile(false)}
                  style={styles.editButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveProfile}
                  style={styles.editButton}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Title style={styles.profileName}>
                {user?.displayName || user?.username}
              </Title>
              <Paragraph style={styles.profileBio}>
                {user?.bio || 'No bio available'}
              </Paragraph>
              <Button 
                mode="outlined" 
                onPress={() => setEditingProfile(true)}
                style={styles.editProfileButton}
              >
                Edit Profile
              </Button>
            </View>
          )}
        </Surface>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatsCard title="Stories Read" value="12" subtitle="This month" />
          <StatsCard title="Reading Streak" value="7" subtitle="Days" />
          <StatsCard title="Favorites" value="24" subtitle="Stories" />
        </View>

        {/* Quick Actions */}
        <Surface style={styles.quickActions}>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          <List.Item
            title="Write a Story"
            description="Share your creativity with the world"
            left={props => <List.Icon {...props} icon="pen" />}
            onPress={() => navigation.navigate('Write')}
            style={styles.actionItem}
          />
          <List.Item
            title="Reading History"
            description="View all your past readings"
            left={props => <List.Icon {...props} icon="history" />}
            onPress={() => {/* Navigate to history */}}
            style={styles.actionItem}
          />
          <List.Item
            title="Language Preferences"
            description="Choose your preferred languages"
            left={props => <List.Icon {...props} icon="translate" />}
            onPress={() => {/* Navigate to language settings */}}
            style={styles.actionItem}
          />
        </Surface>

        {/* Settings */}
        <Surface style={styles.settings}>
          <Title style={styles.sectionTitle}>Settings</Title>
          
          <List.Item
            title="Dark Mode"
            description="Switch to dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
              />
            )}
          />
          
          <List.Item
            title="Notifications"
            description="Get updates about new stories"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
              />
            )}
          />
          
          <List.Item
            title="Auto-play Audio"
            description="Automatically start audio narration"
            left={props => <List.Icon {...props} icon="play-circle" />}
            right={() => (
              <Switch
                value={autoPlay}
                onValueChange={setAutoPlay}
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="About Ulimi"
            description="Learn more about the app"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {/* Show about dialog */}}
          />
          
          <List.Item
            title="Help & Support"
            description="Get help or contact us"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {/* Navigate to help */}}
          />
        </Surface>

        {/* Sign Out */}
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.signOutButton}
          textColor="#d32f2f"
        >
          Sign Out
        </Button>
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
  profileHeader: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  avatar: {
    backgroundColor: '#667eea',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#ffffff',
    elevation: 2,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileBio: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  editProfileButton: {
    marginTop: 8,
  },
  editForm: {
    width: '100%',
  },
  editInput: {
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editButton: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  settings: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  actionItem: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  signOutButton: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    borderColor: '#d32f2f',
  },
});

export default ProfileScreen;