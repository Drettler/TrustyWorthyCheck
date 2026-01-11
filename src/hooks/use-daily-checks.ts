import { useState, useCallback } from 'react';

const STORAGE_KEY = 'daily_checks_info';
const DEFAULT_MAX = 3; // Anonymous users get 3 checks

interface ChecksInfo {
  remaining: number;
  limit: number;
  resetAt: string | null;
  lastUpdated: string;
}

function getStoredInfo(): ChecksInfo {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const info = JSON.parse(stored) as ChecksInfo;
      
      // Check if reset time has passed
      if (info.resetAt && new Date(info.resetAt) < new Date()) {
        // Reset expired, return fresh state
        return { remaining: DEFAULT_MAX, limit: DEFAULT_MAX, resetAt: null, lastUpdated: new Date().toISOString() };
      }
      
      // Auto-reset if lastUpdated is more than 24 hours ago (fallback for missing resetAt)
      if (info.lastUpdated) {
        const lastUpdatedTime = new Date(info.lastUpdated).getTime();
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (now - lastUpdatedTime > twentyFourHours) {
          return { remaining: DEFAULT_MAX, limit: DEFAULT_MAX, resetAt: null, lastUpdated: new Date().toISOString() };
        }
      }
      
      return info;
    }
  } catch (e) {
    console.error('Error reading checks info:', e);
  }
  return { remaining: DEFAULT_MAX, limit: DEFAULT_MAX, resetAt: null, lastUpdated: new Date().toISOString() };
}

function saveInfo(info: ChecksInfo) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Error saving checks info:', e);
  }
}

export function useDailyChecks() {
  const [checksInfo, setChecksInfo] = useState<ChecksInfo>(getStoredInfo);

  const updateFromResponse = useCallback((remaining: number, limit: number, resetAt: string) => {
    const newInfo: ChecksInfo = {
      remaining,
      limit,
      resetAt,
      lastUpdated: new Date().toISOString(),
    };
    setChecksInfo(newInfo);
    saveInfo(newInfo);
  }, []);

  const useCheck = useCallback((): boolean => {
    // Read current state directly from storage to avoid stale closure
    const currentInfo = getStoredInfo();
    if (currentInfo.remaining <= 0) {
      return false;
    }
    const newInfo = {
      ...currentInfo,
      remaining: currentInfo.remaining - 1,
      lastUpdated: new Date().toISOString(),
    };
    saveInfo(newInfo);
    setChecksInfo(newInfo);
    return true;
  }, []);

  const resetForDemo = useCallback(() => {
    const freshInfo: ChecksInfo = {
      remaining: DEFAULT_MAX,
      limit: DEFAULT_MAX,
      resetAt: null,
      lastUpdated: new Date().toISOString(),
    };
    setChecksInfo(freshInfo);
    saveInfo(freshInfo);
  }, []);

  return {
    checksRemaining: checksInfo.remaining,
    maxChecks: checksInfo.limit,
    resetAt: checksInfo.resetAt,
    isLimitReached: checksInfo.remaining <= 0,
    useCheck,
    updateFromResponse,
    resetForDemo,
  };
}
