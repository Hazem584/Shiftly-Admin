import type { AdminAccess } from "../auth/admin-access";
import type {
  AdministratorCatalog,
  SaveAdministrator,
} from "../../features/administrators/domain/models";
import type {
  AlertFeed,
  AlertPolicy,
} from "../../features/alerts/domain/models";
import type {
  SupportPage,
  SupportPerson,
  SupportStatus,
  SupportTicket,
} from "../../features/support/domain/models";
import type { Overview, Settings } from "../../features/platform/domain/models";
import type { AppIconCatalog } from "../../features/app-icons/domain/models";
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
  administrators(signal?: AbortSignal): Promise<AdministratorCatalog>;
  saveAdministrator(value: SaveAdministrator): Promise<unknown>;
  alerts(signal?: AbortSignal): Promise<AlertFeed>;
  acknowledgeAlert(id: string): Promise<unknown>;
  saveAlertPolicy(value: AlertPolicy): Promise<unknown>;
  support(
    query: { page: number; status?: SupportStatus },
    signal?: AbortSignal,
  ): Promise<SupportPage>;
  supportTicket(id: string, signal?: AbortSignal): Promise<SupportTicket>;
  supportAssignees(signal?: AbortSignal): Promise<SupportPerson[]>;
  replySupport(id: string, body: string, clientId: string): Promise<unknown>;
  updateSupport(
    id: string,
    value: {
      revision: number;
      status: SupportStatus;
      assigneeId: string | null;
      reason: string;
    },
  ): Promise<unknown>;
  supportImage(id: string, signal?: AbortSignal): Promise<Blob>;
  appIcons(signal?: AbortSignal): Promise<AppIconCatalog>;
  uploadAppIcon(name: string, image: Blob): Promise<{ key: string }>;
  selectAppIcon(key: string, revision: number): Promise<unknown>;
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
  authorize(signal?: AbortSignal): Promise<AdminAccess>;
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
