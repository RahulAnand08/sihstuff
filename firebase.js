import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
    getAuth,
    GoogleAuthProvider,
    GithubAuthProvider,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBnBV-odPDJy3xlGQYgAOjuHslzZrvHXgI",
    authDomain: "raahi-sih.firebaseapp.com",
    projectId: "raahi-sih",
    storageBucket: "raahi-sih.firebasestorage.app",
    messagingSenderId: "282663917118",
    appId: "1:282663917118:web:df50de43f49aa110a7236f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, db, googleProvider, githubProvider };
