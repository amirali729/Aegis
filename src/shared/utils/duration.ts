const UNIT_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationMs(input: string, fallbackMs: number): number {
  const match = /^(\d+)\s*([smhd])$/.exec(input.trim());

  if (!match) {
    return fallbackMs;
  }

  const [, amount, unit] = match;
  const unitMs = UNIT_MS[unit as string];

  if (amount === undefined || unitMs === undefined) {
    return fallbackMs;
  }

  return Number(amount) * unitMs;
}
