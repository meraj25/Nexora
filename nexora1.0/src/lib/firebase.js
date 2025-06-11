// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3jSjeEghgMmPw2MowVD0glymTGCqugOc",
  authDomain: "nexoracampuscopilot.firebaseapp.com",
  projectId: "nexoracampuscopilot",
  storageBucket: "nexoracampuscopilot.firebasestorage.app",
  messagingSenderId: "591316285632",
  appId: "1:591316285632:web:f5adb7598a44a2b1bb5525",
  measurementId: "G-QN4G724CDK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db };
