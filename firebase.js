import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Replace these values with the configuration from Firebase Console.
const firebaseConfig = {
    apiKey: "__FIREBASE_API_KEY__",
    authDomain: "raahi-sih.firebaseapp.com",
    projectId: "raahi-sih",
    storageBucket: "raahi-sih.firebasestorage.app",
    messagingSenderId: "282663917118",
    appId: "__FIREBASE_APP_ID__"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, db, googleProvider, githubProvider };
