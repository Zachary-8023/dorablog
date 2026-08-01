import { writable } from "svelte/store";

export const toasts = writable([]);

let nextId = 1;

export function showToast(message, type = "info", duration = 3000) {
  const id = nextId++;

  toasts.update((items) => [...items, { id, message, type, duration }]);

  return id;
}

export function showSuccess(message, duration = 3000) {
  return showToast(message, "success", duration);
}

export function showError(message, duration = 4000) {
  return showToast(message, "error", duration);
}

export function showWarning(message, duration = 3500) {
  return showToast(message, "warning", duration);
}

export function showInfo(message, duration = 3000) {
  return showToast(message, "info", duration);
}

export function removeToast(id) {
  toasts.update((items) => items.filter((item) => item.id !== id));
}
