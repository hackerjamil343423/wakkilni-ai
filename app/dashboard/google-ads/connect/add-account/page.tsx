"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Info } from "lucide-react";

export default function AddAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => {
    try {
      const refreshToken = searchParams.get("refreshToken");

      if (!refreshToken) {
        setError("Missing authorization token. Please try connecting again.");
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading page:", err);
      setError("Invalid authorization data. Please try connecting again.");
      setLoading(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const refreshToken = searchParams.get("refreshToken");
    if (!refreshToken) {
      setError("Missing authorization token. Please try connecting again.");
      return;
    }

    // Clean customer ID - remove dashes and spaces
    const cleanCustomerId = customerId.replace(/[\s-]/g, "");

    // Validate customer ID (should be 10 digits)
    if (!/^\d{10}$/.test(cleanCustomerId)) {
      setError("Please enter a valid 10-digit Google Ads Customer ID (e.g., 123-456-7890)");
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const response = await fetch("/api/google-ads/accounts/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
          customerIds: [cleanCustomerId],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to connect account");
      }

      // Redirect to dashboard on success
      router.push("/dashboard/google-ads?connected=true");
    } catch (err) {
      console.error("Error connecting account:", err);
      setError(err instanceof Error ? err.message : "Failed to connect account. Please try again.");
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !searchParams.get("refreshToken")) {
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
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Add Google Ads Account</CardTitle>
          <CardDescription>
            Enter your Google Ads Customer ID to connect your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Where to find your Customer ID?</p>
                  <p className="text-blue-600 dark:text-blue-300">
                    1. Go to your Google Ads account<br />
                    2. Click the tools icon (wrench) in the top right<br />
                    3. Select "Account settings" from the menu<br />
                    4. Your Customer ID is displayed at the top (format: 123-456-7890)
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                type="text"
                placeholder="123-456-7890"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={connecting}
                className="font-mono"
              />
              <p className="text-xs text-zinc-500">
                Enter your 10-digit Google Ads Customer ID (dashes optional)
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={connecting || !customerId}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Account"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/connect-platform")}
            className="w-full"
            disabled={connecting}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
