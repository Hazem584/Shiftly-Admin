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
} from "lucide-react";
export const navigation = [
  { id: "overview", icon: LayoutDashboard },
  { id: "users", icon: Users },
  { id: "workspaces", icon: Building2 },
  { id: "requests", icon: Activity },
  { id: "sessions", icon: Radio },
  { id: "releases", icon: Download },
  { id: "appIcons", icon: Image },
  { id: "settings", icon: Settings2 },
  { id: "audit", icon: History },
] as const;
export type PageId = (typeof navigation)[number]["id"];
