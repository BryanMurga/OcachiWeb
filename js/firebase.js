// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6uG5EjY5uC0CK4Qb-6yuo2MHlbyp5jPQ",
  authDomain: "ocachiweb.firebaseapp.com",
  projectId: "ocachiweb",
  storageBucket: "ocachiweb.firebasestorage.app",
  messagingSenderId: "796211825925",
  appId: "1:796211825925:web:fa07db2cef3eea0e19bb6c",
  measurementId: "G-PK4KV8HKPW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { app, db, auth };
