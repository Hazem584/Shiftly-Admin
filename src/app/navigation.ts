import {
  LayoutDashboard,
  Users,
  Building2,
  Settings2,
  History,
} from "lucide-react";
export const navigation = [
  { id: "overview", icon: LayoutDashboard },
  { id: "users", icon: Users },
  { id: "workspaces", icon: Building2 },
  { id: "settings", icon: Settings2 },
  { id: "audit", icon: History },
] as const;
export type PageId = (typeof navigation)[number]["id"];
