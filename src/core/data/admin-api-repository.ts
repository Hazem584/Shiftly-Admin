import type { AdminRepository } from "../domain/admin-repository";
import { request } from "./http-client";
export const adminRepository: AdminRepository = {
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
