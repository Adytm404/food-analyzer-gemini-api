
import { FoodEntry } from '../types';
import { LOCAL_STORAGE_KEY_FOOD_ENTRIES } from '../constants';

export const getFoodEntries = (): FoodEntry[] => {
  const entriesJson = localStorage.getItem(LOCAL_STORAGE_KEY_FOOD_ENTRIES);
  if (entriesJson) {
    try {
      return JSON.parse(entriesJson) as FoodEntry[];
    } catch (error) {
      console.error("Error parsing food entries from localStorage:", error);
      return [];
    }
  }
  return [];
};

export const saveFoodEntry = (entry: FoodEntry): FoodEntry[] => {
  const entries = getFoodEntries();
  const updatedEntries = [entry, ...entries]; // Add new entry to the beginning
  localStorage.setItem(LOCAL_STORAGE_KEY_FOOD_ENTRIES, JSON.stringify(updatedEntries));
  return updatedEntries;
};

export const deleteFoodEntry = (entryId: string): FoodEntry[] => {
  let entries = getFoodEntries();
  entries = entries.filter(entry => entry.id !== entryId);
  localStorage.setItem(LOCAL_STORAGE_KEY_FOOD_ENTRIES, JSON.stringify(entries));
  return entries;
};

export const clearAllEntries = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEY_FOOD_ENTRIES);
};
