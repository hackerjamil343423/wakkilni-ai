export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited" | "suspended";
  lastActive: Date;
  invitedAt?: Date;
}

export interface WorkspaceSettings {
  name: string;
  avatar?: string;
  timezone: string;
  dataRetention: "30" | "90" | "180" | "365" | "forever";
}
