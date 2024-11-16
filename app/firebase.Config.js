import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyBNsv1xtdBwvj-bMea4K7QH8xlOVMzeF5Q",
    authDomain: "test-139fe.firebaseapp.com",
    projectId: "test-139fe",
    storageBucket: "test-139fe.firebasestorage.app",
    messagingSenderId: "229992515473",
    appId: "1:229992515473:web:ef94c6a65dcb9d63bb7c30",
    measurementId: "G-NNPDKLHZDY"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;