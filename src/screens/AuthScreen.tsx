import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Surface,
  Title,
  Paragraph,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthScreenProps {
  onComplete?: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!username) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    // For signup, require password and email
    if (!isLogin && (!password || !email)) {
      Alert.alert('Error', 'Please fill in all required fields for signup');
      return;
    }

    // For login, require password
    if (isLogin && !password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/signin' : '/api/auth/signup';
      const body = isLogin 
        ? { username, password }
        : { username, email, password, displayName: displayName || username };

      const response = await fetch(`http://10.0.2.2:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data
        await AsyncStorage.setItem('ulimi_user', JSON.stringify(data));
        Alert.alert('Success', `${isLogin ? 'Signed in' : 'Account created'} successfully!`);
        if (onComplete) {
          onComplete();
        }
      } else {
        Alert.alert('Error', data.message || 'Authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDemoMode = async () => {
    try {
      const demoUser = {
        id: 1,
        username: 'demo_user',
        email: 'demo@ulimi.com',
        displayName: 'Demo User',
        onboardingCompleted: false,
      };
      
      await AsyncStorage.setItem('ulimi_user', JSON.stringify(demoUser));
      Alert.alert('Demo Mode', 'Welcome to Ulimi Demo!');
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start demo mode');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.logo}>📚</Text>
            <Title style={styles.title}>Welcome to Ulimi</Title>
            <Paragraph style={styles.subtitle}>
              Your multilingual reading companion
            </Paragraph>
          </View>

          <Surface style={styles.formContainer}>
            <Title style={styles.formTitle}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Title>

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
            />

            {!isLogin && (
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}

            {!isLogin && (
              <TextInput
                label="Display Name (Optional)"
                value={displayName}
                onChangeText={setDisplayName}
                mode="outlined"
                style={styles.input}
              />
            )}

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />

            <Button
              mode="contained"
              onPress={handleAuth}
              style={styles.authButton}
              loading={loading}
              disabled={loading}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>

            <Button
              mode="text"
              onPress={() => setIsLogin(!isLogin)}
              style={styles.switchButton}
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </Button>

            <Divider style={styles.divider} />

            <Button
              mode="outlined"
              onPress={handleDemoMode}
              style={styles.demoButton}
            >
              Try Demo Mode
            </Button>
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b35',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    elevation: 4,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  authButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  switchButton: {
    marginBottom: 20,
  },
  divider: {
    marginBottom: 20,
  },
  demoButton: {
    borderColor: '#ff6b35',
  },
});

export default AuthScreen;