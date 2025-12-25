"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ExternalLink } from "lucide-react";

export default function NoAccountsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            No Google Ads Accounts Found
          </CardTitle>
          <CardDescription>
            We couldn't find any Google Ads accounts associated with your Google account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription className="text-sm space-y-2">
              <p>This could happen if:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>You don't have any Google Ads accounts yet</li>
                <li>You logged in with a different Google account</li>
                <li>You don't have access to any Google Ads accounts</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm font-medium">Next steps:</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => window.open("https://ads.google.com/", "_blank")}
              >
                Create a Google Ads Account
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/api/google-ads/oauth/authorize")}
              >
                Try Again with Different Account
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={() => router.push("/dashboard/connect-platform")}
            className="w-full"
          >
            Go Back to Connections
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
