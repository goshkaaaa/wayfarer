"use client";

import { useSyncExternalStore } from "react";
import { initialTrip, validateTrip } from "./trip";

const key = "wayfarer:trip:v1";
const serverSnapshot = { trip: initialTrip, ready: false, error: "" };
let snapshot;
const listeners = new Set();

function readSnapshot() {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return { trip: initialTrip, ready: true, error: "" };
    const parsed = JSON.parse(saved);
    return validateTrip(parsed)
      ? { trip: parsed, ready: true, error: "" }
      : {
          trip: initialTrip,
          ready: true,
          error: "The saved trip could not be read. Showing a sample trip.",
        };
  } catch {
    return {
      trip: initialTrip,
      ready: true,
      error: "Browser storage is unavailable. You can still export your trip.",
    };
  }
}
function getSnapshot() {
  return (snapshot ||= readSnapshot());
}
function emit() {
  listeners.forEach((listener) => listener());
}
function onStorage(event) {
  if (event.key !== key && event.key !== null) return;
  snapshot = readSnapshot();
  emit();
}
function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}
function setTrip(update) {
  const current = getSnapshot();
  const trip = typeof update === "function" ? update(current.trip) : update;
  let error = "";
  try {
    localStorage.setItem(key, JSON.stringify(trip));
  } catch {
    error = "Could not save in this browser. Export a backup before leaving.";
  }
  snapshot = { trip, ready: true, error };
  emit();
}
export function useTrip() {
  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => serverSnapshot,
  );
  return { ...state, setTrip };
}
