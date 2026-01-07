import { useState, useEffect } from 'react';

const STORAGE_KEY = 'scam-or-legit-daily-checks';
const MAX_FREE_CHECKS = 1;

interface DailyCheckData {
  date: string;
  count: number;
}

export function useDailyChecks() {
  const [checksRemaining, setChecksRemaining] = useState(MAX_FREE_CHECKS);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const loadCheckData = (): DailyCheckData => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as DailyCheckData;
        // Reset if it's a new day
        if (data.date !== getTodayString()) {
          return { date: getTodayString(), count: 0 };
        }
        return data;
      }
    } catch (e) {
      console.error('Error loading check data:', e);
    }
    return { date: getTodayString(), count: 0 };
  };

  const saveCheckData = (data: DailyCheckData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving check data:', e);
    }
  };

  useEffect(() => {
    const data = loadCheckData();
    const remaining = Math.max(0, MAX_FREE_CHECKS - data.count);
    setChecksRemaining(remaining);
    setIsLimitReached(remaining === 0);
  }, []);

  const useCheck = (): boolean => {
    const data = loadCheckData();
    
    if (data.count >= MAX_FREE_CHECKS) {
      setIsLimitReached(true);
      setChecksRemaining(0);
      return false;
    }

    const newData = { date: getTodayString(), count: data.count + 1 };
    saveCheckData(newData);
    
    const remaining = Math.max(0, MAX_FREE_CHECKS - newData.count);
    setChecksRemaining(remaining);
    setIsLimitReached(remaining === 0);
    
    return true;
  };

  const resetForDemo = () => {
    const data = { date: getTodayString(), count: 0 };
    saveCheckData(data);
    setChecksRemaining(MAX_FREE_CHECKS);
    setIsLimitReached(false);
  };

  return {
    checksRemaining,
    isLimitReached,
    useCheck,
    resetForDemo,
    maxChecks: MAX_FREE_CHECKS,
  };
}
