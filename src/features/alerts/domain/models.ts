export type AlertKind = "ERROR_SPIKE" | "CHAT_LATENCY" | "PUSH_BACKLOG";
export interface AlertSample {
  id?: string;
  requestId?: string;
  userId?: string | null;
  workspaceId?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  createdAt: string;
  type?: string;
  kind?: string;
  sessionId?: string;
}
export interface OperationalAlert {
  id: string;
  kind: AlertKind;
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
  episode: number;
  revision: number;
  detectedAt: string;
  lastSeenAt: string;
  windowStart: string;
  resolvedAt: string | null;
  details: {
    metrics: {
      requests: number;
      errors: number;
      appErrors: number;
      chatRequests: number;
      chatP95Ms: number;
      pushCount: number;
      pushOldestSeconds: number;
    };
    samples: AlertSample[];
    appSamples: AlertSample[];
  };
}
export interface AlertPolicy {
  revision: number;
  errorCount: number;
  errorRatePercent: number;
  minimumRequests: number;
  chatP95Ms: number;
  minimumChatRequests: number;
  pushBacklogCount: number;
  pushOldestSeconds: number;
  lastEvaluatedAt: string | null;
}
export interface AlertFeed {
  items: OperationalAlert[];
  policy: AlertPolicy;
}
