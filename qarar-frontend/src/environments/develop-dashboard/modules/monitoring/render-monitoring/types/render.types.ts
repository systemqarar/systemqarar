export interface RenderStatus {
  status: 'online' | 'offline' | 'maintenance';
  latency: string;
  uptime: string;
  region: string;
  environment: string;
}

export interface RenderLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}
