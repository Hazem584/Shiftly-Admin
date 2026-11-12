import {
  LayoutDashboard,
  Users,
  Building2,
  Settings2,
  History,
  Activity,
  Radio,
  Download,
  Image,
  Bell,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
export const navigation = [
  { id: "overview", permission: "overview.read", icon: LayoutDashboard },
  { id: "users", permission: "users.read", icon: Users },
  { id: "workspaces", permission: "workspaces.read", icon: Building2 },
  { id: "requests", permission: "monitoring.read", icon: Activity },
  { id: "sessions", permission: "monitoring.read", icon: Radio },
  { id: "releases", permission: "settings.read", icon: Download },
  { id: "appIcons", permission: "settings.read", icon: Image },
  { id: "settings", permission: "settings.read", icon: Settings2 },
  { id: "audit", permission: "audit.read", icon: History },
  { id: "alerts", permission: "alerts.read", icon: Bell },
  { id: "support", permission: "support.read", icon: LifeBuoy },
  { id: "administrators", permission: "admins.manage", icon: ShieldCheck },
] as const;
export type PageId = (typeof navigation)[number]["id"];
