export interface RenderServiceStatus {
  status: 'online' | 'offline' | 'maintenance';
  latency: string;
  uptime: string;
  region: string;
  environment: string;
}

export interface RenderLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}
