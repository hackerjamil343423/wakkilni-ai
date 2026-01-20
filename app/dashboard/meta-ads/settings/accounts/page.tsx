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
import { useMetaAdsConnection } from "@/lib/meta-ads/hooks/useMetaAds";
import { Plus, Trash2, RefreshCw, CheckCircle2, ArrowLeft, Building2, Stars } from "lucide-react";
import { DisconnectDialog } from "@/app/dashboard/_components/disconnect-dialog";

interface MetaAdAccount {
  id: string;
  accountId: string;
  accountName: string;
  accountLabel?: string;
  currency?: string;
  timezone?: string;
  status: string;
  isPrimary: boolean;
  lastSyncedAt?: Date | null;
  createdAt: Date;
}

export default function MetaAdsAccountsSettingsPage() {
  const router = useRouter();
  const { accounts, activeAccountId, switchAccount, connect, disconnect } = useMetaAdsConnection();
  const [refreshing, setRefreshing] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  const handleRefreshAccounts = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleSetPrimary = async (accountId: string) => {
    try {
      const response = await fetch("/api/meta-ads/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to set primary account");
      }

      // Refresh accounts to show updated primary
      await handleRefreshAccounts();
    } catch (error) {
      console.error("Failed to set primary account:", error);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      setDisconnectingId(accountId);
      await disconnect(accountId);
      setDisconnectingId(null);

      // If no accounts left, redirect to platform page
      if (accounts.length === 1) {
        router.push("/dashboard/connect-platform?tab=connect-platform");
      }
    } catch (error) {
      console.error("Failed to disconnect account:", error);
      setDisconnectingId(null);
    }
  };

  const handleConnectNew = () => {
    connect();
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
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Meta Ads Accounts
                </CardTitle>
                <CardDescription>
                  Manage your connected Meta (Facebook & Instagram) advertising accounts
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
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
                  size="sm"
                  onClick={handleConnectNew}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Connect New Account
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Meta Ads accounts connected</h3>
                <p className="text-sm text-slate-500 mb-6">
                  Connect your Meta Ads account to start tracking your Facebook and Instagram ad performance
                </p>
                <Button
                  onClick={handleConnectNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Connect Your First Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Account ID</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.accountName}</span>
                            {account.isPrimary && (
                              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs gap-1">
                                <Stars className="h-3 w-3" />
                                Primary
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {account.accountId}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {account.currency || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={account.status === "active" ? "default" : "secondary"}
                            className={
                              account.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300"
                            }
                          >
                            {account.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(account.lastSyncedAt)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!account.isPrimary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPrimary(account.id)}
                                className="text-xs"
                              >
                                Set Primary
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnect(account.id)}
                              disabled={disconnectingId === account.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Info Section */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Connected accounts can access campaigns, ad sets, and ads
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Set your primary account to control which data is shown by default in the Meta Ads dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disconnect Confirmation Dialog */}
        <DisconnectDialog
          isOpen={!!disconnectingId}
          onOpenChange={(open) => !open && setDisconnectingId(null)}
          accountName={accounts.find(a => a.id === disconnectingId)?.accountName || "this account"}
          accountId={disconnectingId || undefined}
          platform="meta-ads"
          onConfirm={async () => {
            if (disconnectingId) {
              await handleDisconnect(disconnectingId);
            }
          }}
        />
      </div>
    </div>
  );
}
