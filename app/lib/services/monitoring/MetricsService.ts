interface MetricPayload {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: number;
}

export class MetricsService {
  static async logMetric(name: string, value: number, tags?: Record<string, string>) {
    const payload: MetricPayload = {
      name,
      value,
      tags,
      timestamp: Date.now()
    };
    
    await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
}