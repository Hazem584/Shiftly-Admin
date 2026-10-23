export interface Audit {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  createdAt: string;
  details: unknown;
}
