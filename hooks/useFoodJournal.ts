
import { useState, useEffect, useCallback } from 'react';
import { FoodEntry, NutritionData, ReportPeriod, ChartDataPoint } from '../types';
import * as StorageManager from '../services/localStorageManager';
import { processImageForUpload } from '../utils/imageProcessor';
import * as DateHelpers from '../utils/dateHelpers';

export const useFoodJournal = () => {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedEntries = StorageManager.getFoodEntries();
      setEntries(storedEntries);
    } catch (e) {
      setError("Failed to load food journal from storage.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFoodEntry = useCallback(async (nutritionData: NutritionData, imageFile: File): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { thumbnail } = await processImageForUpload(imageFile);
      const newEntry: FoodEntry = {
        ...nutritionData,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageBase64: thumbnail,
      };
      const updatedEntries = StorageManager.saveFoodEntry(newEntry);
      setEntries(updatedEntries);
    } catch (e) {
      const err = e as Error;
      setError(`Failed to add food entry: ${err.message}`);
      console.error(e);
      throw e; // Re-throw to allow UI to handle if needed
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteEntry = useCallback((entryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedEntries = StorageManager.deleteFoodEntry(entryId);
      setEntries(updatedEntries);
    } catch (e) {
      setError("Failed to delete entry.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearJournal = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      StorageManager.clearAllEntries();
      setEntries([]);
    } catch (e) {
      setError("Failed to clear journal.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getReportData = useCallback((period: ReportPeriod): ChartDataPoint[] => {
    switch (period) {
      case ReportPeriod.DAILY:
        return DateHelpers.getDailyReportData(entries);
      case ReportPeriod.WEEKLY:
        return DateHelpers.getWeeklyReportData(entries);
      case ReportPeriod.MONTHLY:
        return DateHelpers.getMonthlyReportData(entries);
      default:
        return [];
    }
  }, [entries]);

  return {
    entries,
    isLoading,
    error,
    addFoodEntry,
    deleteEntry,
    clearJournal,
    getReportData,
    setError, // Allow components to set errors manually if needed (e.g., API errors)
  };
};
