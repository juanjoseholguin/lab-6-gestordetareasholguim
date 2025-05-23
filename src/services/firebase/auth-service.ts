import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./firebase-config";

export async function registerUser(
  email: string,
  password: string,
  username: string
): Promise<{ success: boolean; user?: User; error?: any }> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    await updateProfile(user, { displayName: username });
    localStorage.setItem("userId", user.uid);
    localStorage.setItem("username", username);
    return { success: true, user };
  } catch (err: any) {
    console.error("🔥 registerUser error:", err.code, err.message);
    return { success: false, error: err };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: any }> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    localStorage.setItem("userId", user.uid);
    if (user.displayName) localStorage.setItem("username", user.displayName);
    return { success: true, user };
  } catch (err: any) {
    console.error("🔥 loginUser error:", err.code, err.message);
    return { success: false, error: err };
  }
}

export async function logoutUser(): Promise<{ success: boolean; error?: any }> {
  try {
    await signOut(auth);
    localStorage.clear();
    return { success: true };
  } catch (err: any) {
    console.error("🔥 logoutUser error:", err.code, err.message);
    return { success: false, error: err };
  }
}

export function onAuthChange(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

