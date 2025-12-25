"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface OAuthSelectionData {
  userId: string;
  refreshToken: string;
  accessToken: string | null;
  expiresIn: number;
  scope: string | null;
  customers: string[];
}

export default function SelectAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionData, setSelectionData] = useState<OAuthSelectionData | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const encodedData = searchParams.get("data");

      if (!encodedData) {
        setError("Missing selection data. Please try connecting again.");
        setLoading(false);
        return;
      }

      // Decode base64url to base64, then decode
      // base64url uses - instead of + and _ instead of /
      const base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const data: OAuthSelectionData = JSON.parse(decoded);

      if (!data.customers || data.customers.length === 0) {
        setError("No accounts available to connect.");
        setLoading(false);
        return;
      }

      setSelectionData(data);
      // Auto-select all accounts by default
      setSelectedCustomers(new Set(data.customers));
      setLoading(false);
    } catch (err) {
      console.error("Error parsing selection data:", err);
      setError("Invalid selection data. Please try connecting again.");
      setLoading(false);
    }
  }, [searchParams]);

  const formatCustomerId = (customerId: string) => {
    // Format as XXX-XXX-XXXX
    const cleaned = customerId.replace(/-/g, "");
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return customerId;
  };

  const toggleCustomer = (customerId: string) => {
    setSelectedCustomers((prev) => {
      const next = new Set(prev);
      if (next.has(customerId)) {
        next.delete(customerId);
      } else {
        next.add(customerId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectionData) {
      setSelectedCustomers(new Set(selectionData.customers));
    }
  };

  const deselectAll = () => {
    setSelectedCustomers(new Set());
  };

  const handleConnect = async () => {
    if (!selectionData || selectedCustomers.size === 0) return;

    setConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/google-ads/accounts/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: selectionData.refreshToken,
          customerIds: Array.from(selectedCustomers),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to connect accounts");
      }

      // Redirect to dashboard on success
      router.push("/dashboard/google-ads?connected=true");
    } catch (err) {
      console.error("Error connecting accounts:", err);
      setError(err instanceof Error ? err.message : "Failed to connect accounts");
      setConnecting(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/connect-platform");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (error && !selectionData) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Connection Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/connect-platform")} className="w-full">
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Select Google Ads Accounts</CardTitle>
          <CardDescription>
            Choose which Google Ads accounts you'd like to connect. You can connect multiple accounts
            and switch between them later.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500">
              {selectedCustomers.size} of {selectionData?.customers.length || 0} accounts selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={selectedCustomers.size === selectionData?.customers.length}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselectAll}
                disabled={selectedCustomers.size === 0}
              >
                Deselect All
              </Button>
            </div>
          </div>

          {/* Account List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectionData?.customers.map((customerId) => {
              const isSelected = selectedCustomers.has(customerId);

              return (
                <div
                  key={customerId}
                  onClick={() => toggleCustomer(customerId)}
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleCustomer(customerId)}
                    className="pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {formatCustomerId(customerId)}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Google Ads Account
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={connecting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={connecting || selectedCustomers.size === 0}
            className="flex-1"
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              `Connect ${selectedCustomers.size} Account${selectedCustomers.size !== 1 ? 's' : ''}`
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
