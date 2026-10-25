export interface Paged<T> {
  items: T[];
  hasNext: boolean;
}
export interface RequestLog {
  id: string;
  createdAt: string;
  requestId: string;
  method: string;
  route: string;
  status: number;
  durationMs: number;
  userId: string | null;
}
export interface RequestMetrics extends Paged<RequestLog> {
  summary: { total: number; errors: number; averageMs: number; p95Ms: number };
  series: { date: string; total: number; errors: number }[];
  endpoints: {
    method: string;
    route: string;
    total: number;
    errors: number;
    averageMs: number;
  }[];
}
export interface AppSession {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  platform: string;
  version: string;
  build: number;
  state: string;
  lastSeenAt: string;
  startedAt: string;
  online: boolean;
  errorCount: number;
}
export interface AppErrorLog {
  id: string;
  sessionId: string;
  userId: string;
  createdAt: string;
  kind: string;
  message: string;
  stack: string;
  requestId: string | null;
}
export interface AppRelease {
  testerVerified?: boolean;
  platform: "android" | "ios" | "web";
  version: string;
  build: number;
  message: string;
  url: string;
  required: boolean;
  enabled: boolean;
  revision: number;
}
export interface MonitoringQuery {
  page: number;
  period?: "day" | "week" | "month";
  userId?: string;
  status?: "all" | "errors";
}
