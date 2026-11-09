export function createSubmissionTracker() {
  let latest = 0;
  return {
    begin: () => ++latest,
    isCurrent: (submission: number) => submission === latest,
    invalidate: () => { latest += 1; },
  };
}