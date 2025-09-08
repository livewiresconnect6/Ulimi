import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Surface,
  Title,
  Paragraph,
  Button,
  Checkbox,
  Text,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';

interface OnboardingScreenProps {
  onComplete?: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    preferredLanguage: 'en',
    userType: [] as string[],
    preferredGenres: [] as string[],
    topicsOfInterest: [] as string[],
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'sw', name: 'Swahili' },
    { code: 'zh', name: 'Chinese' },
  ];

  const userTypes = [
    'Reader - I love discovering new stories',
    'Writer - I want to share my creativity',
    'Both - I enjoy reading and writing',
    'Explorer - I\'m curious about different cultures',
  ];

  const genres = [
    'Children\'s Stories', 'Fiction', 'Romance', 'Mystery', 'Thriller', 'Fantasy', 
    'Science Fiction', 'Adventure', 'Drama', 'Comedy', 'Historical',
    'Non-fiction', 'Biography', 'Self-help', 'Educational',
  ];

  const topics = [
    'Reading', 'African Culture', 'Travel', 'Technology', 'History', 
    'Art & Music', 'Food & Cooking', 'Sports', 'Nature',
    'Business', 'Health & Wellness', 'Family', 'Friendship',
  ];

  const handleLanguageSelect = (langCode: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredLanguage: langCode
    }));
  };

  const handleMultiSelect = (category: keyof typeof preferences, item: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].includes(item)
        ? (prev[category as keyof typeof prev] as string[]).filter(i => i !== item)
        : [...(prev[category as keyof typeof prev] as string[]), item]
    }));
  };

  const savePreferences = async () => {
    try {
      if (!user) return;

      // Update user preferences in backend
      const response = await fetch(`http://10.0.2.2:5000/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...preferences,
          onboardingCompleted: true,
        }),
      });

      if (response.ok) {
        // Update local storage
        const updatedUser = {
          ...user,
          ...preferences,
          onboardingCompleted: true,
        };
        await AsyncStorage.setItem('ulimi_user', JSON.stringify(updatedUser));
        
        Alert.alert('Welcome!', 'Your preferences have been saved. Let\'s start exploring!');
        if (onComplete) {
          onComplete();
        }
      } else {
        Alert.alert('Error', 'Failed to save preferences');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    }
  };

  const renderLanguageStep = () => (
    <Surface style={styles.stepContainer}>
      <Title style={styles.stepTitle}>Choose Your Language</Title>
      <Paragraph style={styles.stepDescription}>
        Select your preferred language for reading stories
      </Paragraph>

      {languages.map((lang) => (
        <View key={lang.code} style={styles.optionRow}>
          <Checkbox
            status={preferences.preferredLanguage === lang.code ? 'checked' : 'unchecked'}
            onPress={() => handleLanguageSelect(lang.code)}
          />
          <Text style={styles.optionText}>{lang.name}</Text>
        </View>
      ))}
    </Surface>
  );

  const renderUserTypeStep = () => (
    <Surface style={styles.stepContainer}>
      <Title style={styles.stepTitle}>What brings you to Ulimi?</Title>
      <Paragraph style={styles.stepDescription}>
        Tell us about your interests (select all that apply)
      </Paragraph>

      {userTypes.map((type) => (
        <View key={type} style={styles.optionRow}>
          <Checkbox
            status={preferences.userType.includes(type) ? 'checked' : 'unchecked'}
            onPress={() => handleMultiSelect('userType', type)}
          />
          <Text style={styles.optionText}>{type}</Text>
        </View>
      ))}
    </Surface>
  );

  const renderGenresStep = () => (
    <Surface style={styles.stepContainer}>
      <Title style={styles.stepTitle}>Favorite Genres</Title>
      <Paragraph style={styles.stepDescription}>
        Which genres do you enjoy most? (select multiple)
      </Paragraph>

      <View style={styles.chipContainer}>
        {genres.map((genre) => (
          <Button
            key={genre}
            mode={preferences.preferredGenres.includes(genre) ? 'contained' : 'outlined'}
            compact
            onPress={() => handleMultiSelect('preferredGenres', genre)}
            style={styles.chipButton}
          >
            {genre}
          </Button>
        ))}
      </View>
    </Surface>
  );

  const renderTopicsStep = () => (
    <Surface style={styles.stepContainer}>
      <Title style={styles.stepTitle}>Topics of Interest</Title>
      <Paragraph style={styles.stepDescription}>
        What topics would you like to explore? (select multiple)
      </Paragraph>

      <View style={styles.chipContainer}>
        {topics.map((topic) => (
          <Button
            key={topic}
            mode={preferences.topicsOfInterest.includes(topic) ? 'contained' : 'outlined'}
            compact
            onPress={() => handleMultiSelect('topicsOfInterest', topic)}
            style={styles.chipButton}
          >
            {topic}
          </Button>
        ))}
      </View>
    </Surface>
  );

  const renderSummaryStep = () => (
    <Surface style={styles.stepContainer}>
      <Title style={styles.stepTitle}>All Set! 🎉</Title>
      <Paragraph style={styles.stepDescription}>
        Here's what we learned about you:
      </Paragraph>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Preferred Language:</Text>
          <Text style={styles.summaryValue}>
            {languages.find(l => l.code === preferences.preferredLanguage)?.name}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>User Type:</Text>
          <Text style={styles.summaryValue}>
            {preferences.userType.join(', ') || 'Not specified'}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Favorite Genres:</Text>
          <Text style={styles.summaryValue}>
            {preferences.preferredGenres.slice(0, 3).join(', ')}
            {preferences.preferredGenres.length > 3 && ` +${preferences.preferredGenres.length - 3} more`}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Topics of Interest:</Text>
          <Text style={styles.summaryValue}>
            {preferences.topicsOfInterest.slice(0, 3).join(', ')}
            {preferences.topicsOfInterest.length > 3 && ` +${preferences.topicsOfInterest.length - 3} more`}
          </Text>
        </View>
      </View>

      <Paragraph style={styles.finalMessage}>
        These preferences will help us recommend stories you'll love. You can always change them later in your profile settings.
      </Paragraph>
    </Surface>
  );

  const steps = [
    renderLanguageStep,
    renderUserTypeStep,
    renderGenresStep,
    renderTopicsStep,
    renderSummaryStep,
  ];

  const stepTitles = [
    'Language',
    'Interests',
    'Genres',
    'Topics',
    'Summary'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Surface style={styles.header}>
          <Title style={styles.welcomeTitle}>Welcome to Ulimi! 📚</Title>
          <Paragraph style={styles.welcomeSubtitle}>
            Let's personalize your reading experience
          </Paragraph>
        </Surface>

        {/* Progress Indicator */}
        <Surface style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}: {stepTitles[currentStep]}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
        </Surface>

        {/* Current Step Content */}
        {steps[currentStep]()}

        {/* Navigation Buttons */}
        <Surface style={styles.navigationContainer}>
          <View style={styles.navigationButtons}>
            <Button
              mode="outlined"
              disabled={currentStep === 0}
              onPress={() => setCurrentStep(currentStep - 1)}
              style={styles.navButton}
            >
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                mode="contained"
                onPress={savePreferences}
                style={styles.navButton}
              >
                Get Started
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => setCurrentStep(currentStep + 1)}
                style={styles.navButton}
              >
                Next
              </Button>
            )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    margin: 16,
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff6b35',
    borderRadius: 3,
  },
  stepContainer: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    marginBottom: 8,
  },
  summaryContainer: {
    marginVertical: 20,
  },
  summaryItem: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  finalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
  navigationContainer: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  navButton: {
    flex: 1,
  },
});

export default OnboardingScreen;