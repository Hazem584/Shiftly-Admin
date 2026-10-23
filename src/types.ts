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
export interface Workspace {
  id: string;
  name: string;
  code: string;
  timezone: string;
  createdAt: string;
  creator: { email: string | null; fullName: string | null };
  _count: { memberships: number };
}
export interface Audit {
  id: string;
  actorId: string;
  action: string;
  targetId: string;
  createdAt: string;
  details: unknown;
}
export const modes: Record<
  Mode,
  { label: string; description: string; color: string }
> = {
  OPERATIONAL: {
    label: "شغّال بالكامل",
    description: "جميع الخدمات متاحة للمستخدمين",
    color: "green",
  },
  MAINTENANCE: {
    label: "وضع الصيانة",
    description: "إيقاف مؤقت لإجراء أعمال الصيانة",
    color: "amber",
  },
  UPDATING: {
    label: "جارٍ التحديث",
    description: "إيقاف مؤقت أثناء تحديث المنصة",
    color: "blue",
  },
  DISABLED: {
    label: "المنصة موقوفة",
    description: "إيقاف الوصول إلى خدمات التطبيق",
    color: "red",
  },
};
export const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("ar-EG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Cairo",
      }).format(new Date(value))
    : "لم يسجل نشاطًا بعد";
export const number = (value: number) =>
  new Intl.NumberFormat("ar-EG").format(value);
