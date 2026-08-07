export interface DailyActivityCount {
  date: string;
  count: number;
}

export interface ActionCount {
  action: string;
  count: number;
}

export class ActivityResponse {
  constructor(
    /** One entry per day, oldest first, always `days` entries long (zero-filled). */
    public readonly dailyCounts: DailyActivityCount[],
    public readonly totalLast7Days: number,
    public readonly totalLast30Days: number,
    public readonly topActions: ActionCount[],
    /** True when this reflects the caller's own actions (no resolved tenant) rather than the whole organization's. */
    public readonly scopedToSelf: boolean,
  ) {}
}
