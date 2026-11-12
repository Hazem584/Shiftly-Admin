import type { AdminRepository } from "../domain/admin-repository";
import { request } from "./http-client";
import type { AppIconCatalog } from "../../features/app-icons/domain/models";
function queryPath(path: string, query: object): string {
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => [key, String(value)]);
  return `${path}?${new URLSearchParams(params)}`;
}

export const adminRepository: AdminRepository = {
  administrators: (signal) => request("administrators", { signal }),
  saveAdministrator: (value) =>
    request("administrators", { method: "PUT", body: JSON.stringify(value) }),
  alerts: (signal) => request("alerts", { signal }),
  acknowledgeAlert: (id) =>
    request(`alerts/${id}/acknowledge`, { method: "POST" }),
  saveAlertPolicy: ({
    revision,
    errorCount,
    errorRatePercent,
    minimumRequests,
    chatP95Ms,
    minimumChatRequests,
    pushBacklogCount,
    pushOldestSeconds,
  }) =>
    request("alerts/policy", {
      method: "PUT",
      body: JSON.stringify({
        revision,
        errorCount,
        errorRatePercent,
        minimumRequests,
        chatP95Ms,
        minimumChatRequests,
        pushBacklogCount,
        pushOldestSeconds,
      }),
    }),
  support: (query, signal) => request(queryPath("support", query), { signal }),
  supportTicket: (id, signal) => request(`support/${id}`, { signal }),
  supportAssignees: (signal) => request("support/assignees", { signal }),
  replySupport: (id, body, clientId) =>
    request(`support/${id}/replies`, {
      method: "POST",
      body: JSON.stringify({ body, clientId }),
    }),
  updateSupport: (id, value) =>
    request(`support/${id}`, { method: "PATCH", body: JSON.stringify(value) }),
  supportImage: (id, signal) =>
    request(`support/${id}/image`, { signal }, "blob"),
  appIcons: async (signal) => {
    const catalog = await request<AppIconCatalog>("app-icons", { signal });
    const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
    return {
      ...catalog,
      icons: catalog.icons.map((icon) => ({
        ...icon,
        previewUrl: `${base}${icon.imagePath}`,
      })),
    };
  },
  uploadAppIcon: (name, image) => {
    const data = new FormData();
    data.append("name", name);
    data.append("icon", image, "icon.png");
    return request("app-icons", { method: "POST", body: data });
  },
  selectAppIcon: (key, revision) =>
    request("app-icons/selection", {
      method: "PUT",
      body: JSON.stringify({ key, revision }),
    }),
  requests: (query, signal) =>
    request(queryPath("monitoring/requests", query), { signal }),
  sessions: (query, signal) =>
    request(queryPath("monitoring/sessions", query), { signal }),
  errors: (query, signal) =>
    request(queryPath("monitoring/errors", query), { signal }),
  releases: (signal) => request("releases", { signal }),
  saveRelease: ({
    testerVerified,
    platform,
    version,
    build,
    message,
    url,
    required,
    enabled,
    revision,
  }) =>
    request("releases", {
      method: "PUT",
      body: JSON.stringify({
        testerVerified: testerVerified === true,
        platform,
        version,
        build,
        message,
        url,
        required,
        enabled,
        revision,
      }),
    }),
  authorize: (signal) => request("me", { signal }),
  overview: (signal) => request("overview", { signal }),
  settings: (signal) => request("settings", { signal }),
  saveSettings: ({
    mode,
    title,
    message,
    announcement,
    registrationEnabled,
    supportEmail,
    revision,
  }) =>
    request("settings", {
      method: "PATCH",
      body: JSON.stringify({
        mode,
        title,
        message,
        announcement,
        registrationEnabled,
        supportEmail: supportEmail || undefined,
        revision,
      }),
    }),
  users: (query, signal) =>
    request(
      `users?${new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))}`,
      { signal },
    ),
  setAccess: (user, reason) =>
    request(`users/${user.id}/access`, {
      method: "PATCH",
      body: JSON.stringify({ suspended: !user.isSuspended, reason }),
    }),
  deletionPreview: (id, signal) =>
    request(`users/${id}/deletion-preview`, { signal }),
  deleteAccount: (id, confirmation, fingerprint) =>
    request(`users/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ confirmation, fingerprint }),
    }),
  deletionJobs: (signal) => request("deletions", { signal }),
  retryDeletion: (id) => request(`deletions/${id}/retry`, { method: "POST" }),
  workspaces: (page, signal) => request(`workspaces?page=${page}`, { signal }),
  audit: (page, signal) => request(`audit?page=${page}`, { signal }),
};
