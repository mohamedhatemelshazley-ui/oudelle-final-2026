import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB7pFoM2AeEJnWo9SVQ594P5pt9tuXRGg4",
  authDomain: "oudelle.firebaseapp.com",
  databaseURL: "https://oudelle-default-rtdb.firebaseio.com",
  projectId: "oudelle",
  storageBucket: "oudelle.firebasestorage.app",
  messagingSenderId: "44390123746",
  appId: "1:44390123746:web:4932a37011924d5bce36bb",
  measurementId: "G-R3LS4MJNSY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
