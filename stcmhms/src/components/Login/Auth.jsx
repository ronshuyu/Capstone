import React, { createContext, useContext, useState, useEffect } from 'react';
import { setPersistence, browserSessionPersistence } from "firebase/auth";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../Firebase/Firebase';

setPersistence(auth, browserSessionPersistence);

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 Create a session document in Firestore
  const createSession = async (uid) => {
    const sessionRef = doc(collection(db, "sessions")); // auto-id
    const sessionId = sessionRef.id;

    await setDoc(sessionRef, {
      uid,
      loginTime: new Date(),
      logoutTime: null,
    });

    localStorage.setItem("sessionId", sessionId); // Save for logout
    return sessionId;
  };

  // 🔹 End session (update logout time)
  const endSession = async () => {
    const sessionId = localStorage.getItem("sessionId");
    if (sessionId) {
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, { logoutTime: new Date() });
      localStorage.removeItem("sessionId");
    }
  };

  // -------------------------
  // Auth Functions
  // -------------------------

  const signup = async (email, password) => {
    try {
      setError('');
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user doc if not exists
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        createdAt: new Date().toISOString(),
        userData: [] // instead of mentalHealthEntries
      });

      await createSession(result.user.uid);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createSession(result.user.uid);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Create profile if missing
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          name: result.user.displayName,
          email: result.user.email,
          createdAt: new Date().toISOString(),
          userData: [] // renamed
        });
      }

      await createSession(result.user.uid);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    await endSession(); // record logout time
    return signOut(auth);
  };

  // -------------------------
  // User Data (replaces mentalHealthEntries)
  // -------------------------

  async function saveUserData(mood, diary) {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const entry = {
        mood,
        diary,
        date: new Date().toISOString(),
        timestamp: Date.now()
      };

      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const currentEntries = userDoc.data().userData || [];
        const updatedEntries = [...currentEntries, entry];

        await setDoc(userRef, {
          ...userDoc.data(),
          userData: updatedEntries,
          lastUpdated: new Date().toISOString()
        });

        return entry;
      }
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  async function getUserData() {
    if (!currentUser) return [];
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data().userData || [];
      }
      return [];
    } catch (error) {
      setError(error.message);
      return [];
    }
  }

  // -------------------------
  // Auth Listener
  // -------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    user: currentUser,
    login,
    signup,
    logout,
    signInWithGoogle,
    saveUserData,       // ✅ new
    getUserData,        // ✅ new
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
