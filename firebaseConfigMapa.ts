/**
 * firebaseConfigMapa.ts
 * 
 * Config EXCLUSIVO para leer reportes_publicos en el mapa.
 * NO modifica ni interfiere con:
 *   - firebaseConfig.ts       (pantallas de moderador)
 *   - firebaseConfigUsuarios.ts (auth, storage, perfil)
 */
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfigMapa = {
  apiKey: "AIzaSyCfwkyv2JPaHb8u06Ab7VcH2v9QJEwRnmY",
  authDomain: "reportes-proyecto-idor.firebaseapp.com",
  projectId: "reportes-proyecto-idor",
  storageBucket: "reportes-proyecto-idor.firebasestorage.app",
  messagingSenderId: "635696829226",
  appId: "1:635696829226:web:a8b40553eb5b23528b0453",
};

// Nombre único "mapa" — nunca colisiona con "reportes" ni con la app default
const appMapa: FirebaseApp =
  getApps().find((a) => a.name === "mapa") ??
  initializeApp(firebaseConfigMapa, "mapa");

// Exportamos como dbMapa — nombre único, no rompe nada existente
export const dbMapa = getFirestore(appMapa);