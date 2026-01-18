"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  customerId: string;
  onConfirm: (newName: string) => Promise<void>;
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  customerId,
  onConfirm,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleConfirm = async () => {
    if (!newName.trim() || newName === currentName) {
      return;
    }

    setIsRenaming(true);
    try {
      await onConfirm(newName.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to rename account:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isRenaming) {
      onOpenChange(open);
      if (!open) {
        setNewName(currentName);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Account</DialogTitle>
          <DialogDescription>
            Change the display name for this Google Ads account. The account ID will remain unchanged.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter account name"
              disabled={isRenaming}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirm();
                }
              }}
            />
          </div>
          <div className="text-xs text-zinc-500">
            Account ID: <span className="font-mono">{customerId}</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isRenaming}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isRenaming || !newName.trim() || newName === currentName}
          >
            {isRenaming ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
