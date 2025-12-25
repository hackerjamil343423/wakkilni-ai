"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Link as LinkIcon } from "lucide-react";

interface ConnectAccountPromptProps {
  onConnect: () => void;
}

export function ConnectAccountPrompt({ onConnect }: ConnectAccountPromptProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <LinkIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Connect Your Google Ads Account</CardTitle>
          <CardDescription className="text-base mt-2">
            Connect your Google Ads account to start analyzing your campaign performance,
            discover optimization opportunities, and make data-driven decisions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">What you'll get:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Real-time campaign performance metrics and KPIs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Keyword quality score analysis and optimization insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>AI-powered recommendations to improve ROAS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Geographic and demographic performance breakdowns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Search term mining for negative keyword discovery</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">How it works:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  1
                </span>
                <span>Click "Connect Google Ads" to authorize access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  2
                </span>
                <span>Sign in with your Google account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  3
                </span>
                <span>Grant read-only access to your Google Ads data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold shrink-0">
                  4
                </span>
                <span>Start exploring your analytics dashboard</span>
              </li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Button
              onClick={onConnect}
              size="lg"
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Google Ads Account
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              We only request read-only access. We'll never modify your campaigns.
            </p>
          </div>

          <div className="pt-4 border-t">
            <details className="text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Privacy & Security
              </summary>
              <div className="text-muted-foreground space-y-2">
                <p>
                  Your data is secure and encrypted. We use industry-standard OAuth 2.0
                  authentication and never store your Google password.
                </p>
                <p>
                  You can disconnect your account at any time from the dashboard settings.
                </p>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
