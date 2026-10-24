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
import type {
  AppErrorLog,
  AppRelease,
  AppSession,
  MonitoringQuery,
  Paged,
  RequestMetrics,
} from "../../features/monitoring/domain/models";
export interface AdminRepository {
  requests(
    query: MonitoringQuery,
    signal?: AbortSignal,
  ): Promise<RequestMetrics>;
  sessions(
    query: MonitoringQuery,
    signal?: AbortSignal,
  ): Promise<Paged<AppSession>>;
  errors(
    query: MonitoringQuery,
    signal?: AbortSignal,
  ): Promise<Paged<AppErrorLog>>;
  releases(signal?: AbortSignal): Promise<AppRelease[]>;
  saveRelease(release: AppRelease): Promise<AppRelease>;
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
