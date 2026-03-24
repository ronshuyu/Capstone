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
import { doc, setDoc, getDoc, collection, updateDoc, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
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
        userData: [] 
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

async function saveUserData(entry) {
  if (!currentUser) throw new Error("User not authenticated");

  const userRef = doc(db, "users", currentUser.uid);

  try {
    // 1️⃣ Update userData in users doc
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) return;

    const currentEntries = userDoc.data().userData || [];
    const updatedEntries = [...currentEntries, entry];

    // 2️⃣ Calculate avgScore across all entries
    const totalScore = updatedEntries.reduce(
      (sum, e) => sum + Number(e.scaledScore || 0),
      0
    );
    const avgScore = Math.round(totalScore / updatedEntries.length);

    await setDoc(userRef, {
      ...userDoc.data(),
      userData: updatedEntries,
      lastUpdated: new Date().toISOString(),
      avgScore
    });

    // 3️⃣ Update mentalHealthScores collection
    const mhCollection = collection(db, "mentalHealthScores");

    // Fetch all previous entries
    const q = query(mhCollection, where("uid", "==", currentUser.uid));
    const querySnapshot = await getDocs(q);

    const allScores = querySnapshot.docs.map(doc => doc.data().scaledScore || 0);
    allScores.push(entry.scaledScore); // include new entry

    const mhAvgScore = Math.round(
      allScores.reduce((sum, s) => sum + s, 0) / allScores.length
    );

    // Add new entry with avgScore
    await addDoc(collection(db, "mentalHealthScores"), {
  uid: currentUser.uid,
  mentalHealthScore: avgScore,
  timestamp: new Date().toISOString(),
});

    return { entry, avgScore: mhAvgScore };
  } catch (error) {
    console.error(error);
    throw error;
  }
}




async function getUserScores() {
  if (!currentUser) return [];

  try {
    const q = query(
      collection(db, "scores"),
      where("uid", "==", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    setError(error.message);
    return [];
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

  async function getUserScores() {
  if (!currentUser) return [];

  try {
    const q = query(
      collection(db, "scores"),
      where("uid", "==", currentUser.uid),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    saveUserData,       
    getUserData,        
    getUserScores,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
