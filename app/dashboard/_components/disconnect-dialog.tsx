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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  accountName?: string;
  accountId?: string;
  platform?: "google-ads" | "meta-ads";
  onConfirm: () => void;
}

export function DisconnectDialog({
  isOpen,
  onOpenChange,
  accountName,
  accountId,
  platform = "meta-ads",
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

  const platformName = platform === "google-ads" ? "Google Ads" : "Meta Ads";

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Disconnect {platformName} Account?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to disconnect <strong>{accountName || accountId}</strong>?
            </p>
            <p className="text-sm">
              This action will:
            </p>
            <ul className="text-sm list-disc list-inside space-y-1 ml-4">
              <li>Remove access to this {platformName} account from the dashboard</li>
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
