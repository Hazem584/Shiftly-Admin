import type { Overview, Settings } from "../../features/platform/domain/models";
import type {
  User,
  UsersPage,
  UsersQuery,
  DeletionPreview,
  DeletionResult,
  DeletionJob,
} from "../../features/users/domain/models";
import type { Workspace } from "../../features/workspaces/domain/models";
import type { Audit } from "../../features/audit/domain/models";
export interface AdminRepository {
  authorize(signal?: AbortSignal): Promise<unknown>;
  overview(signal?: AbortSignal): Promise<Overview>;
  settings(signal?: AbortSignal): Promise<Settings>;
  saveSettings(settings: Settings): Promise<Settings>;
  users(query: UsersQuery, signal?: AbortSignal): Promise<UsersPage>;
  setAccess(user: User, reason: string): Promise<unknown>;
  deletionPreview(id: string, signal?: AbortSignal): Promise<DeletionPreview>;
  deleteAccount(
    id: string,
    confirmation: string,
    fingerprint: string,
  ): Promise<DeletionResult>;
  deletionJobs(signal?: AbortSignal): Promise<DeletionJob[]>;
  retryDeletion(id: string): Promise<DeletionResult>;
  workspaces(page: number, signal?: AbortSignal): Promise<Workspace[]>;
  audit(page: number, signal?: AbortSignal): Promise<Audit[]>;
}
