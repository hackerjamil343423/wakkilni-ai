import { TeamMember, WorkspaceSettings } from "./types";

export const mockTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Ahmad Ali",
    email: "ahmad@wakklni.ai",
    role: "owner",
    status: "active",
    lastActive: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
  },
  {
    id: "member-2",
    name: "Fatima Hassan",
    email: "fatima@wakklni.ai",
    role: "admin",
    status: "active",
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: "member-3",
    name: "Mohammed Khalid",
    email: "mohammed@wakklni.ai",
    role: "member",
    status: "active",
    lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "member-4",
    name: "Sarah Ahmed",
    email: "sarah@wakklni.ai",
    role: "member",
    status: "invited",
    invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastActive: new Date(),
  },
];

export const defaultWorkspaceSettings: WorkspaceSettings = {
  name: "Wakklni AI Workspace",
  timezone: "Asia/Riyadh",
  dataRetention: "365",
};
