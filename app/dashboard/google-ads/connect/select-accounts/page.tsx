"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface SessionData {
  sessionId: string;
  customers: string[];
}

function SelectAccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sessionId = searchParams.get("session");

    if (!sessionId) {
      setError("Missing session data. Please try connecting again.");
      setLoading(false);
      return;
    }

    // Fetch session data from secure API endpoint
    fetch(`/api/google-ads/oauth/session?id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load session data");
        }
        return response.json();
      })
      .then((data) => {
        if (!data.customers || data.customers.length === 0) {
          setError("No accounts available to connect.");
          setLoading(false);
          return;
        }

        setSessionData({
          sessionId: data.sessionId,
          customers: data.customers,
        });
        // Auto-select all accounts by default
        setSelectedCustomers(new Set(data.customers));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching session data:", err);
        setError(err.message || "Invalid session data. Please try connecting again.");
        setLoading(false);
      });
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
    if (sessionData) {
      setSelectedCustomers(new Set(sessionData.customers));
    }
  };

  const deselectAll = () => {
    setSelectedCustomers(new Set());
  };

  const handleConnect = async () => {
    if (!sessionData || selectedCustomers.size === 0) return;

    setConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/google-ads/accounts/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: sessionData.sessionId,
          customerIds: Array.from(selectedCustomers),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Failed to connect accounts";

        if (data.error) {
          if (data.error.includes("ECONNRESET") || data.error.includes("connection")) {
            errorMessage = "Connection was reset. This could be due to network issues. Please check your internet connection and try again.";
          } else if (data.error.includes("ETIMEDOUT") || data.error.includes("timeout")) {
            errorMessage = "Request timed out. The Google Ads API may be experiencing issues. Please try again in a moment.";
          } else if (data.error.includes("Unauthorized")) {
            errorMessage = "Authorization failed. Please try connecting again.";
          } else {
            errorMessage = data.message || data.error;
          }
        }

        if (data.message) {
          errorMessage = data.message;
        }

        throw new Error(errorMessage);
      }

      // Redirect to settings page on success
      router.push("/dashboard/google-ads/settings/accounts?connected=true");
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

  if (error && !sessionData) {
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
              {selectedCustomers.size} of {sessionData?.customers.length || 0} accounts selected
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={selectedCustomers.size === sessionData?.customers.length}
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
            {sessionData?.customers.map((customerId) => {
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

export default function SelectAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            <p className="text-sm text-zinc-500">Loading accounts...</p>
          </div>
        </div>
      }
    >
      <SelectAccountsContent />
    </Suspense>
  );
}
