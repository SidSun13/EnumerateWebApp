// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCHgihINayEC45drk8EFdKBIhYw9C83hLc",
  authDomain: "enumerate-cb399.firebaseapp.com",
  projectId: "enumerate-cb399",
  storageBucket: "enumerate-cb399.appspot.com",
  messagingSenderId: "2649853808",
  appId: "1:2649853808:web:b2883baf1bab86ec6f89b5",
  measurementId: "G-20YMEJS23D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)


const storage = getStorage(app);
const db = getFirestore(app)
const auth = getAuth(app)

export { storage, auth, db };