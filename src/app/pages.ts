import { lazy } from "react";

export const OverviewPage = lazy(() =>
  import("../features/overview/presentation/OverviewPage").then((module) => ({
    default: module.OverviewPage,
  })),
);

export const UsersPage = lazy(() =>
  import("../features/users/presentation/UsersPage").then((module) => ({
    default: module.UsersPage,
  })),
);

export const SettingsPage = lazy(() =>
  import("../features/platform/presentation/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  })),
);

export const WorkspacesPage = lazy(() =>
  import("../features/workspaces/presentation/WorkspacesPage").then(
    (module) => ({ default: module.WorkspacesPage }),
  ),
);

export const AuditPage = lazy(() =>
  import("../features/audit/presentation/AuditPage").then((module) => ({
    default: module.AuditPage,
  })),
);

export const RequestsPage = lazy(() =>
  import("../features/monitoring/presentation/RequestsPage").then((module) => ({
    default: module.RequestsPage,
  })),
);

export const SessionsPage = lazy(() =>
  import("../features/monitoring/presentation/SessionsPage").then((module) => ({
    default: module.SessionsPage,
  })),
);

export const ReleasesPage = lazy(() =>
  import("../features/monitoring/presentation/ReleasesPage").then((module) => ({
    default: module.ReleasesPage,
  })),
);

export const AppIconsPage = lazy(() =>
  import("../features/app-icons/presentation/AppIconsPage").then((module) => ({
    default: module.AppIconsPage,
  })),
);
