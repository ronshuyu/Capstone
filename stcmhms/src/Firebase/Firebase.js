// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase config object (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyCzGnJso4AUPYIvmTQHy1_XOcOfMNau3Kc",
  authDomain: "capstone-d394f.firebaseapp.com",
  projectId: "capstone-d394f",
  storageBucket: "capstone-d394f.firebasestorage.app",
  messagingSenderId: "845677520597",
  appId: "1:845677520597:web:14b2cc5f18d1333916a45c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
