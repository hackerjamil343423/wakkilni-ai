"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";

interface DisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId?: string;
  accountCount?: number;
  isActive?: boolean;
  onConfirm: () => Promise<void>;
}

export function DisconnectDialog({
  open,
  onOpenChange,
  accountId,
  accountCount,
  isActive,
  onConfirm,
}: DisconnectDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Error disconnecting:", error);
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  // Single account disconnect
  if (accountId) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Disconnect Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Are you sure you want to disconnect account <strong>{accountId}</strong>?
              </p>
              {isActive && (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  This is your currently active account. You will be switched to another account
                  if available.
                </p>
              )}
              <p className="text-sm">
                This action will:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                <li>Remove access to this Google Ads account from the dashboard</li>
                <li>Delete stored authentication tokens</li>
                <li>Clear cached data for this account</li>
              </ul>
              <p className="text-sm text-zinc-500">
                You can reconnect this account anytime by going through the OAuth flow again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Disconnect all accounts
  if (accountCount) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Disconnect All Accounts?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-amber-600 dark:text-amber-400 font-medium">
                Are you sure you want to disconnect all {accountCount} Google Ads accounts?
              </p>
              <p className="text-sm">
                This action will:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                <li>Remove access to all {accountCount} Google Ads accounts</li>
                <li>Delete all stored authentication tokens</li>
                <li>Clear all cached data</li>
                <li>Return you to the connection page</li>
              </ul>
              <p className="text-sm text-zinc-500">
                You can reconnect any account anytime by going through the OAuth flow again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting All...
                </>
              ) : (
                `Disconnect All ${accountCount} Accounts`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return null;
}
