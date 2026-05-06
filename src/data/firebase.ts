import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyALfn2o-j2IQasqAE0HBQhrGuINm-JN3So",
  authDomain: "angela-guidebook.firebaseapp.com",
  projectId: "angela-guidebook",
  storageBucket: "angela-guidebook.firebasestorage.app",
  messagingSenderId: "1057599627011",
  appId: "1:1057599627011:web:c7260a3a35daf210e61336",
  measurementId: "G-Q5BRQSTY13",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
