import { FirebaseApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfigUsuarios = {
  apiKey: "AIzaSyBo6aD-tbYZbTyvrH0fbK-s4E-jMAW66Ls",
  authDomain: "usuarios-798cc.firebaseapp.com",
  projectId: "usuarios-798cc",
  storageBucket: "usuarios-798cc.firebasestorage.app", // Este bucket es donde se guardarán las fotos
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
export const storage = getStorage(appUsuarios); // <-- Exportar el servicio de Storage
