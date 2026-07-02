import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCkS2UZv48R4LV7i0zlmG-H-iU-uoXw2jY",
  authDomain: "saivi-s-collection.firebaseapp.com",
  projectId: "saivi-s-collection",
  storageBucket: "saivi-s-collection.firebasestorage.app",
  messagingSenderId: "124940592505",
  appId: "1:124940592505:web:f76aec1dcaab3466a33ba8",
  measurementId: "G-4DH708QQV5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytesResumable, getDownloadURL };
