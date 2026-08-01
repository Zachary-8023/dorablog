import { writable } from "svelte/store";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const userStore = writable(null);

export async function loadMe() {
  try {
    const res = await fetch(`${API}/api/auth/userInfo`, {
      credentials: "include"
    });
    if (!res.ok) return userStore.set(null);
    const { user } = await res.json();
    console.log("User loaded from API:", user);
    console.log("User avatarUrl:", user.avatarUrl);
    userStore.set(user);
  } catch (error) {
    console.error("Error loading user:", error);
    userStore.set(null);
  }
}
