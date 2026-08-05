/**
 * Delay before retry attempt N (1-indexed - the attempt number that just
 * FAILED). With the model's default maxAttempts of 6, this schedule
 * covers attempts 1-5 failing (each scheduling the next retry); attempt
 * 6 failing has no further entry to consult because the caller checks
 * attemptNumber >= maxAttempts first and dead-letters instead of calling
 * this at all (see webhook-delivery-worker.ts).
 */
const BACKOFF_SCHEDULE_MS = [
  60_000, // 1 minute
  5 * 60_000, // 5 minutes
  30 * 60_000, // 30 minutes
  2 * 60 * 60_000, // 2 hours
  12 * 60 * 60_000, // 12 hours
];

export function computeNextRetryDelayMs(failedAttemptNumber: number): number {
  const index = failedAttemptNumber - 1;
  return BACKOFF_SCHEDULE_MS[index] ?? BACKOFF_SCHEDULE_MS[BACKOFF_SCHEDULE_MS.length - 1]!;
}
