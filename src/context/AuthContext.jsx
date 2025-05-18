import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// Create the auth context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Register a new user with email and password
  const register = async (email, password, displayName) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's profile with the display name
      await updateProfile(user, {
        displayName: displayName || 'Anonymous Player'
      });
      
      // Send email verification
      await sendEmailVerification(user);
      
      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        displayName: displayName || 'Anonymous Player',
        email: user.email,
        points: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        bestTime: null,
        winRate: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        gameHistory: []
      });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login timestamp
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          id: userCredential.user.uid,
          displayName: userCredential.user.displayName || 'Anonymous Player',
          email: userCredential.user.email,
          points: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          bestTime: null,
          winRate: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          gameHistory: []
        });
      }
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in Firestore
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          id: result.user.uid,
          displayName: result.user.displayName || 'Anonymous Player',
          email: result.user.email,
          points: 0,
          gamesPlayed: 0,
          gamesWon: 0,
          bestTime: null,
          winRate: 0,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          gameHistory: []
        });
      } else {
        // Update last login timestamp
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      }
      
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName) => {
    try {
      setError(null);
      if (!currentUser) throw new Error('No user is logged in');
      
      await updateProfile(currentUser, { displayName });
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { displayName }, { merge: true });
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        displayName
      });
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Create the value object
  const value = {
    currentUser,
    isLoggedIn: !!currentUser,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 