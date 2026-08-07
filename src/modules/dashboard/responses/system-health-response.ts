export class SystemHealthResponse {
  constructor(
    public readonly status: 'ok' | 'degraded',
    public readonly uptimeSeconds: number,
    public readonly database: 'connected' | 'disconnected',
    public readonly environment: string,
    public readonly nodeVersion: string,
    public readonly memory: { rssMB: number; heapUsedMB: number; heapTotalMB: number },
    public readonly timestamp: string,
  ) {}
}
