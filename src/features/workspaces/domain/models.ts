export interface Workspace {
  id: string;
  name: string;
  code: string;
  timezone: string;
  createdAt: string;
  creator: { email: string | null; fullName: string | null };
  _count: { memberships: number };
}
