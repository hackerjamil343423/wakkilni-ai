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
import { useTranslation } from "@/hooks/use-translation";

interface PlatformDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformName: string;
  platformId: string;
  onConfirm: () => Promise<void>;
}

export function PlatformDisconnectDialog({
  open,
  onOpenChange,
  platformName,
  platformId,
  onConfirm,
}: PlatformDisconnectDialogProps) {
  const { t } = useTranslation();
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {t("disconnectDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                {t("disconnectDialog.description")} <strong>{platformName}</strong>?
              </p>
              <p className="text-sm">{t("disconnectDialog.warning")}</p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-2">
                <li>{t("disconnectDialog.warning1")}</li>
                <li>{t("disconnectDialog.warning2")}</li>
              </ul>
              <p className="text-sm text-zinc-500">
                {t("disconnectDialog.reconnectNote")}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{t("disconnectDialog.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("disconnectDialog.disconnecting")}
              </>
            ) : (
              t("disconnectDialog.confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
