import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBBt3PTdctzq1dGbKP0UxLDaDaSApqU_lg",
  authDomain: "podai-425012.firebaseapp.com",
  projectId: "podai-425012",
  storageBucket: "podai-425012.appspot.com",
  messagingSenderId: "197233010794",
  appId: "1:197233010794:web:b6f71e4ab2d989b5710213",
  measurementId: "G-11VMLCSB72"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to sign in with a custom token
const signInWithToken = async (token) => {
  try {
    await signInWithCustomToken(auth, token);
  } catch (error) {
    console.error("Error signing in with custom token", error);
  }
};

export { auth, db, storage, signInWithToken };
