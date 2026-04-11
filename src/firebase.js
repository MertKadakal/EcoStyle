import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBT9uZ0xszolIceun-CgYaFdAn8O3kpbYY",
  authDomain: "cantakilit.firebaseapp.com",
  projectId: "cantakilit",
  storageBucket: "cantakilit.firebasestorage.app",
  messagingSenderId: "726775147759",
  appId: "1:726775147759:android:bae4bac69762c82c0d7f1a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
