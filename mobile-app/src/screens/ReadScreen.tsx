import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { IconButton, Menu, Chip } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ReadScreen = ({ navigation, route }: any) => {
  const [fontSize, setFontSize] = useState(16);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [menuVisible, setMenuVisible] = useState(false);

  const languages = ['English', 'Swahili', 'Zulu', 'Xhosa', 'Afrikaans'];
  
  const storyContent = `In a village nestled between rolling hills and vast skies, lived a girl named Amara whose eyes held the depth of twilight. While other children played during the day, Amara felt most alive when the first stars appeared in the evening sky.

Her grandmother, Gogo Naledi, noticed how Amara would sit outside every night, gazing upward with intense concentration. "Child," she would say, "what do you see up there that captivates you so?"

"They're speaking, Gogo," Amara would whisper. "The stars are telling stories."

At first, her family thought it was childhood imagination. But as Amara grew, her predictions about weather and harvests – all based on what the stars "told" her – proved remarkably accurate.

One year, a terrible drought threatened the village. The crops withered, the river slowed to a trickle, and the people grew desperate. The village elders consulted every known remedy, but nothing worked.

That night, Amara sat under the star-filled sky, her heart heavy with her people's suffering. Suddenly, the stars seemed to pulse brighter, and she heard their ancient voices more clearly than ever before.

"Young Star-Speaker," they whispered in harmony, "the earth sleeps too deeply. You must wake the underground rivers with the old songs."

"But I don't know the old songs," Amara replied.

"Listen with your heart," the brightest star pulsed. "Your grandmother's grandmother knew them. They flow in your blood like starlight."`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Girl Who Spoke to Stars</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="more-vert"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item title="Font Size" onPress={() => {}} />
          <Menu.Item title="Share" onPress={() => {}} />
          <Menu.Item title="Report" onPress={() => {}} />
        </Menu>
      </View>

      <View style={styles.storyHeader}>
        <Text style={styles.storyTitle}>The Girl Who Spoke to Stars</Text>
        <Text style={styles.storyAuthor}>by Nomsa Dlamini</Text>
        <View style={styles.storyMeta}>
          <Chip mode="outlined" compact>Fantasy</Chip>
          <Text style={styles.readTime}>15 min read</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.languageList}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang && styles.languageButtonActive
                ]}
                onPress={() => setSelectedLanguage(lang)}
              >
                <Text style={[
                  styles.languageButtonText,
                  selectedLanguage === lang && styles.languageButtonTextActive
                ]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.fontControls}>
          <TouchableOpacity
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            style={styles.fontButton}
          >
            <Text style={styles.fontButtonText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            style={styles.fontButton}
          >
            <Text style={styles.fontButtonText}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.storyText, { fontSize }]}>
          {storyContent}
        </Text>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Audiobook', { storyId: route.params?.storyId })}
        >
          <MaterialIcons name="headphones" size={24} color="#6366f1" />
          <Text style={styles.actionButtonText}>Listen</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="bookmark-border" size={24} color="#6366f1" />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="favorite-border" size={24} color="#6366f1" />
          <Text style={styles.actionButtonText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={24} color="#6366f1" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  storyHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  storyAuthor: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readTime: {
    fontSize: 14,
    color: '#64748b',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  languageList: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  languageButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  languageButtonText: {
    fontSize: 12,
    color: '#374151',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  fontControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  storyText: {
    lineHeight: 24,
    color: '#374151',
    textAlign: 'justify',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6366f1',
    marginTop: 4,
  },
});

export default ReadScreen;