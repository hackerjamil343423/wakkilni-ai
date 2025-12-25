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
import { Plus, Trash2, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";
import { DisconnectDialog } from "../../_components/disconnect-dialog";

export default function AccountsSettingsPage() {
  const router = useRouter();
  const { accounts, activeCustomerId, connect, refetchAccounts, disconnectAccount, disconnectAll } =
    useGoogleAdsConnection();
  const [refreshing, setRefreshing] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [showDisconnectAll, setShowDisconnectAll] = useState(false);

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

  const handleDisconnectAll = async () => {
    try {
      await disconnectAll();
      setShowDisconnectAll(false);
      router.push("/dashboard/connect-platform");
    } catch (error) {
      console.error("Failed to disconnect all accounts:", error);
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
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDisconnectingId(account.customerId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Disconnect All */}
                {accounts.length > 1 && (
                  <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm">Disconnect All Accounts</h3>
                        <p className="text-sm text-zinc-500 mt-1">
                          Remove all {accounts.length} connected Google Ads accounts at once
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDisconnectAll(true)}
                      >
                        Disconnect All
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Disconnect Dialogs */}
        {disconnectingId && (
          <DisconnectDialog
            open={!!disconnectingId}
            onOpenChange={(open) => !open && setDisconnectingId(null)}
            accountId={formatCustomerId(disconnectingId)}
            isActive={disconnectingId === activeCustomerId}
            onConfirm={() => handleDisconnect(disconnectingId)}
          />
        )}

        {showDisconnectAll && (
          <DisconnectDialog
            open={showDisconnectAll}
            onOpenChange={setShowDisconnectAll}
            accountCount={accounts.length}
            onConfirm={handleDisconnectAll}
          />
        )}
      </div>
    </div>
  );
}
