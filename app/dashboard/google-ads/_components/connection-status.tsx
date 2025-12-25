"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
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
      <Badge variant="default" className="gap-1.5 bg-green-500 hover:bg-green-600">
        <CheckCircle2 className="h-3 w-3" />
        Connected
      </Badge>

      {/* Account Switcher replaces the simple customer ID display */}
      <AccountSwitcher onAccountSwitch={onRefresh} />

      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        className="h-8"
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Refresh
      </Button>
    </div>
  );
}
