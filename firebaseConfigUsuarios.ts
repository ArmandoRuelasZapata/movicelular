import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfigUsuarios = {
  apiKey: "AIzaSyBo6aD-tbYZbTyvrH0fbK-s4E-jMAW66Ls",
  authDomain: "usuarios-798cc.firebaseapp.com",
  projectId: "usuarios-798cc",
  storageBucket: "usuarios-798cc.firebasestorage.app",
  messagingSenderId: "81536412575",
  appId: "1:81536412575:web:54cf93b4a073591a9aebaa",
};

let appUsuarios: FirebaseApp;

if (getApps().find((a) => a.name === "usuarios")) {
  appUsuarios = getApps().find((a) => a.name === "usuarios")!;
} else {
  appUsuarios = initializeApp(firebaseConfigUsuarios, "usuarios");
}

export const auth = getAuth(appUsuarios);
export const db = getFirestore(appUsuarios);
export const storage = getStorage(appUsuarios);

// Persiste la sesión manualmente con AsyncStorage
// Firebase guarda internamente el token, esto lo refuerza para React Native
const AUTH_PERSISTENCE_KEY = "@auth_user";

// Al iniciar, restauramos el estado si existe
AsyncStorage.getItem(AUTH_PERSISTENCE_KEY).catch(() => null);

// Escucha cambios de sesión y los guarda/elimina en AsyncStorage
onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      await AsyncStorage.setItem(AUTH_PERSISTENCE_KEY, user.uid);
    } else {
      await AsyncStorage.removeItem(AUTH_PERSISTENCE_KEY);
    }
  } catch (error) {
    console.error("Error persistiendo sesión:", error);
  }
});
