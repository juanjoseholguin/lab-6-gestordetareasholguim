

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAwx-JEbtifOJM4u8-axmcAhi1VLEUAzk0",
  authDomain: "lab6holguin.firebaseapp.com",
  projectId: "lab6holguin",
  storageBucket: "lab6holguin.appspot.com",
  messagingSenderId: "988962451433",
  appId: "1:988962451433:web:0c5d304761ce1895472578",
  measurementId: "G-P1TT7BL8VZ"
};


const app = initializeApp(firebaseConfig);


export const db   = getFirestore(app);
export const auth = getAuth(app);
