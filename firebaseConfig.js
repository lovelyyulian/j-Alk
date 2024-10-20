import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBM29CXk9C534GZh5-ciBik3y1W22ZpM7Q",
  authDomain: "accountsetup-9c508.firebaseapp.com",
  projectId: "accountsetup-9c508",
  storageBucket: "accountsetup-9c508.appspot.com",
  messagingSenderId: "444572077421",
  appId: "1:444572077421:web:36b731ee50961af7b55e64",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar o Firebase Auth apenas se ainda não foi inicializado
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Inicializar o Firestore
const db = getFirestore(app);

export { app, auth, db };
