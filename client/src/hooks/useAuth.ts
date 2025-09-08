import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, handleRedirect } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import type { User as AppUser } from "../../../shared/schema";

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('ulimi_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id && parsedUser.username) {
          setAppUser(parsedUser);
          setLoading(false);
          return;
        }
      } catch (error) {
        localStorage.removeItem('ulimi_user');
      }
    }

    // Handle Firebase authentication redirect
    handleRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        await createOrUpdateAppUser(user);
      } else {
        setFirebaseUser(null);
        setAppUser(null);
        localStorage.removeItem('ulimi_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createOrUpdateAppUser = async (firebaseUser: User) => {
    try {
      // Always fetch the latest user data from the database
      const response = await apiRequest('GET', `/api/users/firebase/${firebaseUser.uid}`);
      const existingUser = await response.json();
      
      // Store the latest user data
      setAppUser(existingUser);
      localStorage.setItem('ulimi_user', JSON.stringify(existingUser));
    } catch (error) {
      // User doesn't exist, create new one
      try {
        const userData = {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || null,
          preferredLanguage: 'en',
          userType: [],
          preferredGenres: [],
          topicsOfInterest: [],
          onboardingCompleted: false,
        };

        const response = await apiRequest('POST', '/api/users', userData);
        const newUser = await response.json();
        
        setAppUser(newUser);
        localStorage.setItem('ulimi_user', JSON.stringify(newUser));
      } catch (createError) {
        console.error('Failed to create user:', createError);
      }
    }
  };

  const handleDemoLogin = async () => {
    // Clear any previous data first (data reset)
    localStorage.removeItem('ulimi_user');
    localStorage.removeItem('ulimi_onboarding_completed');
    localStorage.removeItem('ulimi_user_preferences');
    localStorage.removeItem('ulimi_reading_progress');
    localStorage.removeItem('ulimi_library_data');
    
    const demoUser: AppUser = {
      id: 1,
      firebaseUid: 'demo-user-' + Date.now(),
      username: 'demo_user',
      email: 'demo@ulimi.app',
      displayName: 'Demo User',
      photoURL: null,
      bio: 'Welcome to Ulimi!',
      preferredLanguage: 'en',
      userType: [],
      preferredGenres: [],
      topicsOfInterest: [],
      onboardingCompleted: false, // Always trigger onboarding after data reset
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setAppUser(demoUser);
    setFirebaseUser(null);
    localStorage.setItem('ulimi_user', JSON.stringify(demoUser));
    console.log('Demo login with data reset completed - onboarding will be triggered');
  };

  const handleLogout = async () => {
    // Complete data reset - clear all user data
    setAppUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('ulimi_user');
    localStorage.removeItem('ulimi_onboarding_completed');
    localStorage.removeItem('ulimi_user_preferences');
    localStorage.removeItem('ulimi_reading_progress');
    localStorage.removeItem('ulimi_library_data');
    
    // Clear any cached queries
    const queryClient = (window as any).queryClient;
    if (queryClient) {
      queryClient.clear();
    }
    
    await auth.signOut();
    console.log('Complete data reset completed - all user data cleared');
  };

  const refreshUser = async () => {
    if (appUser?.firebaseUid) {
      try {
        const response = await apiRequest('GET', `/api/users/firebase/${appUser.firebaseUid}`);
        const updatedUser = await response.json();
        setAppUser(updatedUser);
        localStorage.setItem('ulimi_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  return {
    firebaseUser,
    user: appUser,
    loading,
    isAuthenticated: !!appUser,
    handleDemoLogin,
    handleLogout,
    refreshUser,
  };
}
