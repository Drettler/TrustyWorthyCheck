import { assertEquals } from 'jsr:@std/assert@1';
import { createSubmissionTracker } from '../../../src/lib/scan-submission.ts';

Deno.test('only the latest submission can finish, including a delayed retry', () => {
  const tracker = createSubmissionTracker();
  const previous = tracker.begin();
  const current = tracker.begin();
  assertEquals(tracker.isCurrent(previous), false);
  assertEquals(tracker.isCurrent(current), true);
  const retry = tracker.begin();
  assertEquals(tracker.isCurrent(current), false);
  assertEquals(tracker.isCurrent(retry), true);
});

Deno.test('resetting the checker invalidates in-flight results and errors', () => {
  const tracker = createSubmissionTracker();
  const active = tracker.begin();
  tracker.invalidate();
  assertEquals(tracker.isCurrent(active), false);
});