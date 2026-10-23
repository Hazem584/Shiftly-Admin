export type Mode = "OPERATIONAL" | "MAINTENANCE" | "UPDATING" | "DISABLED";
export interface Settings {
  mode: Mode;
  title: string;
  message: string;
  announcement: string;
  registrationEnabled: boolean;
  supportEmail: string | null;
  revision: number;
}
export interface Overview {
  users: number;
  suspended: number;
  online: number;
  workspaces: number;
  recentUsers: number;
  status: Settings;
}
export const modeKeys = {
  OPERATIONAL: {
    label: "operational",
    description: "operationalDescription",
    color: "green",
  },
  MAINTENANCE: {
    label: "maintenance",
    description: "maintenanceDescription",
    color: "amber",
  },
  UPDATING: {
    label: "updating",
    description: "updatingDescription",
    color: "blue",
  },
  DISABLED: {
    label: "disabled",
    description: "disabledDescription",
    color: "red",
  },
} as const;
