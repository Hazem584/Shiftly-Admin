export type SupportStatus =
  "OPEN" | "IN_PROGRESS" | "WAITING_REPORTER" | "RESOLVED" | "CLOSED";
export interface SupportPerson {
  id: string;
  fullName: string | null;
  email: string | null;
}
export interface SupportReply {
  id: string;
  authorKind: "STAFF" | "REPORTER";
  body: string;
  createdAt: string;
  author: { fullName: string | null };
}
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: SupportStatus;
  revision: number;
  workspaceId: string;
  reporterId: string;
  assigneeId: string | null;
  reporter: SupportPerson;
  assignee: SupportPerson | null;
  workspace: { id: string; name: string };
  relatedKind: string | null;
  relatedLabel: string | null;
  hasImage: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: SupportReply[];
}
export interface SupportPage {
  items: SupportTicket[];
  hasNext: boolean;
}
export const supportStatuses: SupportStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_REPORTER",
  "RESOLVED",
  "CLOSED",
];
