// Daily check restrictions removed - unlimited checks allowed

export function useDailyChecks() {
  return {
    checksRemaining: Infinity,
    isLimitReached: false,
    useCheck: () => true,
    resetForDemo: () => {},
    maxChecks: Infinity,
  };
}
