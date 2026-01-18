"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGoogleAdsConnection } from "@/lib/google-ads/hooks/useGoogleAds";
import { Plus, Trash2, RefreshCw, CheckCircle2, ArrowLeft, Pencil } from "lucide-react";
import { DisconnectDialog } from "../../_components/disconnect-dialog";
import { RenameDialog } from "./_components/rename-dialog";

export default function AccountsSettingsPage() {
  const router = useRouter();
  const { accounts, activeCustomerId, connect, refetchAccounts, disconnectAccount, disconnectAll } =
    useGoogleAdsConnection();
  const [refreshing, setRefreshing] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [renamingAccount, setRenamingAccount] = useState<{ customerId: string; name: string } | null>(null);

  const formatCustomerId = (customerId: string) => {
    const cleaned = customerId.replace(/-/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return customerId;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const handleRefreshAccounts = async () => {
    setRefreshing(true);
    await refetchAccounts();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleDisconnect = async (customerId: string) => {
    try {
      await disconnectAccount(customerId);
      setDisconnectingId(null);

      // If no accounts left, redirect to platform page
      if (accounts.length === 1) {
        router.push("/dashboard/connect-platform");
      }
    } catch (error) {
      console.error("Failed to disconnect account:", error);
    }
  };

  const handleRename = async (customerId: string, newName: string) => {
    try {
      const response = await fetch("/api/google-ads/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, accountName: newName }),
      });

      if (!response.ok) {
        throw new Error("Failed to rename account");
      }

      // Refresh accounts to show updated name
      await refetchAccounts();
    } catch (error) {
      console.error("Failed to rename account:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Google Ads Accounts</CardTitle>
                <CardDescription>
                  Manage your connected Google Ads accounts. You can connect multiple accounts
                  and switch between them in the dashboard.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshAccounts}
                  disabled={refreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  onClick={connect}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Connect Another
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-zinc-500 mb-4">No Google Ads accounts connected</p>
                <Button onClick={connect} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Connect Your First Account
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => {
                      const isActive = account.customerId === activeCustomerId;

                      return (
                        <TableRow key={account.customerId}>
                          <TableCell className="font-mono text-sm">
                            <div className="flex items-center gap-2">
                              {formatCustomerId(account.customerId)}
                              {isActive && (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{account.accountName}</span>
                              {isActive && (
                                <span className="text-xs text-zinc-500">Active</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={account.status === "active" ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-zinc-600 dark:text-zinc-400">
                            {formatDate(account.lastSyncedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRenamingAccount({ customerId: account.customerId, name: account.accountName })}
                                className="gap-1"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Rename
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDisconnectingId(account.customerId)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 gap-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rename Dialog */}
        {renamingAccount && (
          <RenameDialog
            open={!!renamingAccount}
            onOpenChange={(open) => !open && setRenamingAccount(null)}
            currentName={renamingAccount.name}
            customerId={formatCustomerId(renamingAccount.customerId)}
            onConfirm={(newName) => handleRename(renamingAccount.customerId, newName)}
          />
        )}

        {/* Disconnect Dialog */}
        {disconnectingId && (
          <DisconnectDialog
            open={!!disconnectingId}
            onOpenChange={(open) => !open && setDisconnectingId(null)}
            accountId={formatCustomerId(disconnectingId)}
            isActive={disconnectingId === activeCustomerId}
            onConfirm={() => handleDisconnect(disconnectingId)}
          />
        )}
      </div>
    </div>
  );
}
