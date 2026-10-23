export interface User {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  createdAt: string;
  lastSeenAt: string | null;
  isSuspended: boolean;
  suspensionReason: string | null;
  isPlatformAdmin: boolean;
  memberships: {
    role: string;
    status: string;
    workspace: { name: string; id: string };
  }[];
}
export interface UsersPage {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}
export interface UsersQuery {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}
export interface DeletionPreview {
  profileId: string;
  confirmation: string;
  fingerprint: string;
  counts: Record<string, number>;
  ownedWorkspaces: { id: string; name: string }[];
  storageObjects: number;
  canDelete: boolean;
}
export type DeletionState = "PENDING" | "PROCESSING" | "FAILED" | "COMPLETED";
export interface DeletionResult {
  profileId: string;
  state: DeletionState;
}
export interface DeletionJob extends DeletionResult {
  createdAt: string;
  updatedAt: string;
  errorCode: string | null;
}
