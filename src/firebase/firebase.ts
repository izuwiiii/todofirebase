// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAmGLKlNxBZRbfesiVsQhRRBesZos6VKWM',
  authDomain: 'testtodo-24ab2.firebaseapp.com',
  projectId: 'testtodo-24ab2',
  storageBucket: 'testtodo-24ab2.firebasestorage.app',
  messagingSenderId: '296213680829',
  appId: '1:296213680829:web:d4ac3a1225d95a9f7c9dd4',
  measurementId: 'G-D5CD7JTMKC',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// const analytics = getAnalytics(app);

export {app, auth}
