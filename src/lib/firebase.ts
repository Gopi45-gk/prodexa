import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAGs3UA8BMd6R0GK5U_aNpn8O3eDNZ6plQ",
  authDomain: "prodexa-73757.firebaseapp.com",
  projectId: "prodexa-73757",
  storageBucket: "prodexa-73757.firebasestorage.app",
  messagingSenderId: "1064932100230",
  appId: "1:1064932100230:web:5a083a9f5a259ca4e46907"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
