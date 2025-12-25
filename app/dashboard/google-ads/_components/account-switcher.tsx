"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Plus, Settings } from "lucide-react";
import { useGoogleAdsConnection, GoogleAdsAccount } from "@/lib/google-ads/hooks/useGoogleAds";
import { cn } from "@/lib/utils";

interface AccountSwitcherProps {
  onAccountSwitch?: () => void;
}

export function AccountSwitcher({ onAccountSwitch }: AccountSwitcherProps) {
  const router = useRouter();
  const { accounts, activeCustomerId, switchAccount, connect } = useGoogleAdsConnection();
  const [isOpen, setIsOpen] = useState(false);

  const activeAccount = accounts.find((acc) => acc.customerId === activeCustomerId);

  const formatCustomerId = (customerId: string) => {
    // Format as XXX-XXX-XXXX
    const cleaned = customerId.replace(/-/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return customerId;
  };

  const formatLastSynced = (date: Date | null) => {
    if (!date) return "Never synced";

    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  const handleAccountClick = (customerId: string) => {
    if (customerId === activeCustomerId) {
      setIsOpen(false);
      return;
    }

    switchAccount(customerId);
    setIsOpen(false);

    // Notify parent component
    if (onAccountSwitch) {
      onAccountSwitch();
    }
  };

  const handleConnectAnother = () => {
    connect();
  };

  const handleManageAccounts = () => {
    router.push("/dashboard/google-ads/settings/accounts");
    setIsOpen(false);
  };

  // If only one account, show simplified button
  if (accounts.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">
            {formatCustomerId(activeAccount?.customerId || "")}
          </span>
          <span className="text-xs text-zinc-500">
            {activeAccount?.accountName}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConnectAnother}
          className="flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          <span className="hidden sm:inline">Add Account</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">
              {formatCustomerId(activeAccount?.customerId || "")}
            </span>
            <span className="text-xs text-zinc-500">
              {activeAccount?.accountName}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel className="font-normal text-zinc-500">
          My Google Ads Accounts
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {accounts.map((account) => {
          const isActive = account.customerId === activeCustomerId;

          return (
            <DropdownMenuItem
              key={account.customerId}
              onClick={() => handleAccountClick(account.customerId)}
              className={cn(
                "flex flex-col items-start gap-1 py-3 cursor-pointer",
                isActive && "bg-zinc-100 dark:bg-zinc-800"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  {isActive && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  <span className="font-medium text-sm">
                    {formatCustomerId(account.customerId)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 pl-6">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {account.accountName}
                </span>
                <span className="text-xs text-zinc-500">
                  Last synced: {formatLastSynced(account.lastSyncedAt)}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleConnectAnother}
          className="flex items-center gap-2 cursor-pointer text-blue-600 dark:text-blue-400"
        >
          <Plus className="h-4 w-4" />
          <span className="font-medium">Connect Another Account</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleManageAccounts}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span>Manage Accounts</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
