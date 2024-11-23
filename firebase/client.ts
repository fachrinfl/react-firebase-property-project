import { initializeApp, getApps } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string) || "",
  authDomain: "react-property-project.firebaseapp.com",
  projectId: "react-property-project",
  storageBucket: "react-property-project.firebasestorage.app",
  messagingSenderId: "777681639067",
  appId: "1:777681639067:web:6290e8d21a560b6ae8d83e",
};

const currentApps = getApps();

let auth: Auth;
let storage: FirebaseStorage;

if (!currentApps.length) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  const app = currentApps[0];
  auth = getAuth(app);
  storage = getStorage(app);
}

export { auth, storage };
