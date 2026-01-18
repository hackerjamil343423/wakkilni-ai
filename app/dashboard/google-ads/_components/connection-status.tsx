"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw, Download } from "lucide-react";
import { AccountSwitcher } from "./account-switcher";

interface ConnectionStatusProps {
  connected: boolean;
  customerId: string | null;
  onDisconnect?: () => void;
  onRefresh: () => void;
}

export function ConnectionStatus({
  connected,
  customerId,
  onDisconnect,
  onRefresh,
}: ConnectionStatusProps) {
  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    console.log("Exporting analytics to PDF...");
  };

  if (!connected) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <XCircle className="h-3 w-3" />
          Not Connected
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Account Switcher */}
      <AccountSwitcher onAccountSwitch={onRefresh} />

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        <span className="hidden sm:inline">Refresh</span>
      </Button>

      {/* Export PDF Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export PDF</span>
      </Button>
    </div>
  );
}
