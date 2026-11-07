import { assertEquals } from 'jsr:@std/assert@1';
import { CALIBRATION_ENTRIES, isCalibrationReviewDue } from './calibration-set.ts';

Deno.test('calibration scenario IDs are unique and reviewed dates are valid', () => {
  const ids = CALIBRATION_ENTRIES.map((entry) => entry.id);
  assertEquals(new Set(ids).size, ids.length);
  for (const entry of CALIBRATION_ENTRIES) {
    assertEquals(Number.isFinite(new Date(`${entry.reviewedOn}T00:00:00Z`).getTime()), true, entry.id);
  }
});

Deno.test('calibration expectations become due only after 30 days', () => {
  const entry = CALIBRATION_ENTRIES[0];
  assertEquals(isCalibrationReviewDue(entry, new Date('2026-12-07T00:00:00Z')), false);
  assertEquals(isCalibrationReviewDue(entry, new Date('2026-12-08T00:00:00Z')), true);
});

Deno.test('score tolerances agree with their expected verdict bands', () => {
  for (const entry of CALIBRATION_ENTRIES) {
    if (entry.expected === 'safe' && entry.expectedScoreMin !== undefined) {
      assertEquals(entry.expectedScoreMin >= 85 || entry.expectedScoreMin >= 75, true, entry.id);
    }
    if (entry.expected === 'danger' && entry.expectedScoreMax !== undefined) {
      assertEquals(entry.expectedScoreMax < 60, true, entry.id);
    }
  }
});
