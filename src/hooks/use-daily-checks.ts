// Daily check restrictions removed - unlimited checks allowed

export function useDailyChecks() {
  return {
    checksRemaining: Infinity,
    isLimitReached: false,
    useCheck: () => false,
    resetForDemo: () => {},
    maxChecks: Infinity,
  };
}
