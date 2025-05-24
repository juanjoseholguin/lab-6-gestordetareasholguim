import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase-config";
import { TaskType } from "../../types/TypesDB";

export async function addTask(
  task: Omit<TaskType, "id">
): Promise<string | null> {
  try {
    const ref = await addDoc(collection(db, "tasks"), {
      ...task,
      createdAt: Timestamp.now(),
    });
    return ref.id;
  } catch (err: any) {
    console.error(
      " addTask error:",
      "code=", err.code,
      "message=", err.message,
      err
    );
    return null;
  }
}

export async function getTasksByUserId(
  userId: string
): Promise<TaskType[]> {
  try {
    const q = query(
      collection(db, "tasks"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<TaskType, "id">)
    }));
  } catch (err) {
    console.error(" getTasksByUserId error:", err);
    return [];
  }
}

export function subscribeTasksByUser(
  userId: string,
  callback: (tasks: TaskType[]) => void
) {
  const q = query(
    collection(db, "tasks"),
    where("userId", "==", userId)
  );
  const unsub = onSnapshot(q, snap => {
    const tasks = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<TaskType, "id">)
    }));
    callback(tasks);
  }, err => {
    console.error(" subscribeTasksByUser error:", err);
  });
  return unsub;
}

export async function updateTask(
  id: string,
  updates: Partial<TaskType>
): Promise<boolean> {
  try {
    await updateDoc(doc(db, "tasks", id), updates);
    return true;
  } catch (err) {
    console.error(" updateTask error:", err);
    return false;
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, "tasks", id));
    return true;
  } catch (err) {
    console.error(" deleteTask error:", err);
    return false;
  }
}
