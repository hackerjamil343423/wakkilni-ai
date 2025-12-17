"use client";

import { useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  Trash2,
  AlertCircle
} from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/patterns/data-table";
import { mockTeamMembers, defaultWorkspaceSettings } from "./mock-data";
import { TeamMember, WorkspaceSettings } from "./types";
import { formatDistanceToNow } from "date-fns";

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings>(
    defaultWorkspaceSettings
  );
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const handleInviteMember = () => {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "invited",
      lastActive: new Date(),
      invitedAt: new Date(),
    };
    setMembers([...members, newMember]);
    setInviteEmail("");
    setInviteRole("member");
    setInviteDialogOpen(false);
  };

  const getRoleColor = (role: TeamMember["role"]) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "admin":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "member":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: TeamMember["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "invited":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "suspended":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
    }
  };

  const columns: DataTableColumn<TeamMember>[] = [
    {
      key: "name",
      label: "Member",
      render: (_, member) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>
              {member.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (role) => (
        <Badge variant="secondary" className={getRoleColor(role as TeamMember["role"])}>
          {role}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (status) => (
        <Badge variant="secondary" className={getStatusColor(status as TeamMember["status"])}>
          {status}
        </Badge>
      ),
    },
    {
      key: "lastActive",
      label: "Last Active",
      sortable: true,
      render: (date) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(date as Date, { addSuffix: true })}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <PageHeader
        title="Team Management"
        description="Manage your workspace members, roles, and permissions."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Team" },
        ]}
        action={
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Admins can manage team members and settings
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember} disabled={!inviteEmail}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <p className="text-sm text-muted-foreground">
            {members.length} members in your workspace
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            data={members}
            columns={columns}
            searchable
            searchPlaceholder="Search members..."
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Workspace Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure your workspace preferences
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                value={workspaceSettings.name}
                onChange={(e) =>
                  setWorkspaceSettings({ ...workspaceSettings, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Default Timezone</Label>
              <Select
                value={workspaceSettings.timezone}
                onValueChange={(value) =>
                  setWorkspaceSettings({ ...workspaceSettings, timezone: value })
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">Asia/Riyadh (GMT+3)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention</Label>
              <Select
                value={workspaceSettings.dataRetention}
                onValueChange={(value: any) =>
                  setWorkspaceSettings({ ...workspaceSettings, dataRetention: value })
                }
              >
                <SelectTrigger id="data-retention">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How long to keep historical data
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Workspace</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace and all associated data
              </p>
            </div>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
