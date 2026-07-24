import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDP-6NDfAbg5RXqg7ku_GxUO7zwCX9XmNE",
  authDomain: "a-a-gusetbook.firebaseapp.com",
  projectId: "a-a-gusetbook",
  storageBucket: "a-a-gusetbook.firebasestorage.app",
  messagingSenderId: "69945835935",
  appId: "1:69945835935:web:fd38a4f45483554eb27daa",
  measurementId: "G-LLS7K1XS2J",
};

// Avoid re-initializing on Next.js hot reloads
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
