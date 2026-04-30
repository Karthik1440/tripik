import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDO_7GLb17TEGvOP_dIp_smVdrxv12x3P8",
  authDomain: "travio-abc99.firebaseapp.com",
  projectId: "travio-abc99",
  storageBucket: "travio-abc99.firebasestorage.app",
  messagingSenderId: "520613978464",
  appId: "1:520613978464:web:ef3774cb62de328c76be05"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);