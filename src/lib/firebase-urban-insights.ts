'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, collection, getDocs, type Firestore } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, type FirebaseStorage } from "firebase/storage";

const urbanInsightsFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase in the browser to prevent build-time errors
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;

if (typeof window !== 'undefined') {
  let urbanInsightsApp: FirebaseApp;
  if (!getApps().some(app => app.name === 'urban-insights')) {
    urbanInsightsApp = initializeApp(urbanInsightsFirebaseConfig, 'urban-insights');
  } else {
    urbanInsightsApp = getApp('urban-insights');
  }
  db = getFirestore(urbanInsightsApp);
  storage = getStorage(urbanInsightsApp);
}

export { db, storage, collection, getDocs, ref, uploadString, getDownloadURL };
export type { Firestore };
