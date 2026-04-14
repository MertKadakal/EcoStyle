import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBuJfpAqt_ohiC9hRnGLbMIMsegGt8J4bI",
  authDomain: "beykoz-3d81a.firebaseapp.com",
  projectId: "beykoz-3d81a",
  storageBucket: "beykoz-3d81a.firebasestorage.app",
  messagingSenderId: "1062993787092",
  appId: "1:1062993787092:web:5c3b2261e8aed7060ee341",
  measurementId: "G-66TKTMGX15"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
