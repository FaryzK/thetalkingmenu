// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "the-talking-menu.firebaseapp.com",
  projectId: "the-talking-menu",
  storageBucket: "the-talking-menu.appspot.com",
  messagingSenderId: "920659770767",
  appId: "1:920659770767:web:97a216512cb9bbacd91ffa",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
