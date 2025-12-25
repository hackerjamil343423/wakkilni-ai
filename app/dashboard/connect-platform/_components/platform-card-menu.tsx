"use client";

import { useRouter } from "next/navigation";
import { MoreVertical, Settings, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlatformCardMenuProps {
  platformId: string;
  platformName: string;
  onDisconnect: () => void;
}

/**
 * Get the settings path for a specific platform
 */
function getSettingsPath(platformId: string): string {
  switch (platformId) {
    case "google-ads":
      return "/dashboard/google-ads/settings/accounts";
    case "meta-ads":
      return "/dashboard/meta-ads/settings";
    case "tiktok-ads":
      return "/dashboard/tiktok-ads/settings";
    case "snapchat-ads":
      return "/dashboard/snapchat-ads/settings";
    case "salla":
      return "/dashboard/salla/settings";
    case "zid":
      return "/dashboard/zid/settings";
    default:
      return `/dashboard/${platformId}/settings`;
  }
}

export function PlatformCardMenu({
  platformId,
  platformName,
  onDisconnect,
}: PlatformCardMenuProps) {
  const router = useRouter();

  const handleSettings = () => {
    router.push(getSettingsPath(platformId));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Open {platformName} menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDisconnect();
          }}
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
        >
          <Unlink className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
