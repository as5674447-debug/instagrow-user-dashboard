import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK6gC4vdS4sWy3Yonp568qm10MsbEeejE",
  authDomain: "insta-grow-6ade2.firebaseapp.com",
  databaseURL: "https://insta-grow-6ade2-default-rtdb.firebaseio.com",
  projectId: "insta-grow-6ade2",
  storageBucket: "insta-grow-6ade2.firebasestorage.app",
  messagingSenderId: "147116305536",
  appId: "1:147116305536:web:95b898d0aff81d53ad0a65",
  measurementId: "G-67QGNTYRQ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
