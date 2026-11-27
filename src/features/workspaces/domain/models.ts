export interface Workspace {
  id: string;
  name: string;
  code: string;
  timezone: string;
  geofenceMode?: "OFF" | "WARN" | "ENFORCE";
  createdAt: string;
  creator: { email: string | null; fullName: string | null };
  _count: { memberships: number; workLocations?: number };
}
