import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfwkyv2JPaHb8u06Ab7VcH2v9QJEwRnmY",
  authDomain: "reportes-proyecto-idor.firebaseapp.com",
  projectId: "reportes-proyecto-idor",
  storageBucket: "reportes-proyecto-idor.firebasestorage.app",
  messagingSenderId: "635696829226",
  appId: "1:635696829226:web:a8b40553eb5b23528b0453",
};

// Si ya existe una app llamada "reportes", la usamos. Si no, la inicializamos con ese nombre.
const appReportes = !getApps().length 
  ? initializeApp(firebaseConfig, "reportes") 
  : getApps().find(a => a.name === "reportes") || initializeApp(firebaseConfig, "reportes");

export const db = getFirestore(appReportes);