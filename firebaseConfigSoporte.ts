import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfigSoporte = {
  apiKey: "AIzaSyDFQya4MsGuo6vkfnNmepo6mwOd9zzZuJI",
  authDomain: "asistencia-movidgo.firebaseapp.com",
  projectId: "asistencia-movidgo",
  storageBucket: "asistencia-movidgo.firebasestorage.app",
  messagingSenderId: "889539075443",
  appId: "1:889539075443:web:df5d468bd89085b7837906",
  measurementId: "G-FG8F7DREKM",
};

// Inicializamos una segunda instancia de Firebase
const appSoporte = initializeApp(firebaseConfigSoporte, "soporteApp");
export const dbSoporte = getFirestore(appSoporte);
export const authSoporte = getAuth(appSoporte);
