import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  preferredLanguage: string;
  userType: string[];
  preferredGenres: string[];
  topicsOfInterest: string[];
  onboardingCompleted: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('ulimi_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('ulimi_user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    refreshUser,
    logout,
  };
}