import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, getRedirectResult, signOut, signInWithRedirect, sendPasswordResetEmail as firebaseSendPasswordResetEmail } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Validate environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

if (!apiKey || !projectId || !appId) {
  console.error('Missing Firebase configuration. Please check your environment variables.');
}

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: `${projectId}.appspot.com`,
  messagingSenderId: "123456789",
  appId: appId,
};

console.log('Firebase config:', { 
  hasApiKey: !!apiKey, 
  hasProjectId: !!projectId, 
  hasAppId: !!appId 
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

const provider = new GoogleAuthProvider();

export function login() {
  if (!apiKey || !projectId || !appId) {
    console.log('Creating demo user for authentication');
    return Promise.resolve({
      user: {
        uid: 'demo-user-' + Date.now(),
        email: 'user@ulimi.app',
        displayName: 'Demo User',
        photoURL: null
      }
    });
  }
  
  // Use popup instead of redirect for web
  return signInWithPopup(auth, provider);
}

export function logout() {
  if (!apiKey || !projectId || !appId) {
    // Demo mode logout
    return Promise.resolve();
  }
  return signOut(auth);
}

export function handleRedirect() {
  if (!apiKey || !projectId || !appId) {
    return Promise.resolve(null);
  }
  return getRedirectResult(auth);
}

export function sendPasswordResetEmail(email: string) {
  if (!apiKey || !projectId || !appId) {
    // Demo mode - simulate password reset
    console.log('Demo mode: Password reset email would be sent to:', email);
    return Promise.resolve();
  }
  return firebaseSendPasswordResetEmail(auth, email);
}
