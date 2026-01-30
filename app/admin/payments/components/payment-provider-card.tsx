/**
 * Payment Provider Card Component
 * Interactive component for managing a payment provider
 */

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, CheckCircle, XCircle, Loader2 } from "lucide-react";
import PaymentProviderForm from "./payment-provider-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentConfigData {
  id: string;
  provider: string;
  enabled: boolean;
  priority: number;
  supportedCountries: string[];
  sandboxMode: boolean;
  apiPublicKey?: string | null;
  webhookUrl?: string | null;
  lastTestStatus?: string | null;
  lastTestMessage?: string | null;
  lastTestedAt?: Date | null;
}

interface ProviderInfo {
  name: string;
  description: string;
  color: string;
}

interface Props {
  config: PaymentConfigData;
  providerInfo: ProviderInfo;
}

export default function PaymentProviderCard({ config }: Props) {
  const [enabled, setEnabled] = useState(config.enabled);
  const [sandboxMode, setSandboxMode] = useState(config.sandboxMode);
  const [isPending, startTransition] = useTransition();
  const [showSettings, setShowSettings] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleToggleEnabled = async (checked: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/payments/config/${config.provider}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: checked }),
          }
        );

        if (response.ok) {
          setEnabled(checked);
        }
      } catch {
        console.error("Failed to toggle provider");
      }
    });
  };

  const handleToggleSandbox = async (checked: boolean) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/payments/config/${config.provider}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sandboxMode: checked }),
          }
        );

        if (response.ok) {
          setSandboxMode(checked);
        }
      } catch {
        console.error("Failed to toggle sandbox");
      }
    });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `/api/admin/payments/config/${config.provider}/test`,
        {
          method: "POST",
        }
      );

      const data = await response.json();
      setTestResult(data.result);
    } catch {
      setTestResult({
        success: false,
        message: "Connection test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      {showSettings ? (
        <PaymentProviderForm
          config={config}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id={`enabled-${config.id}`}
                checked={enabled}
                onCheckedChange={handleToggleEnabled}
                disabled={isPending}
              />
              <Label htmlFor={`enabled-${config.id}`}>Enabled</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id={`sandbox-${config.id}`}
                checked={sandboxMode}
                onCheckedChange={handleToggleSandbox}
                disabled={isPending}
              />
              <Label htmlFor={`sandbox-${config.id}`}>Sandbox Mode</Label>
            </div>

            {config.supportedCountries && config.supportedCountries.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Countries:</span>
                <div className="flex flex-wrap gap-1">
                  {config.supportedCountries.slice(0, 5).map((country) => (
                    <Badge key={country} variant="outline" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                  {config.supportedCountries.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.supportedCountries.length - 5}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || !enabled}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Full Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {config.lastTestStatus && (
            <div className="text-xs text-muted-foreground">
              Last tested:{" "}
              {config.lastTestedAt
                ? new Date(config.lastTestedAt).toLocaleString()
                : "Never"}
              {" - "}
              <span
                className={
                  config.lastTestStatus === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {config.lastTestStatus === "success" ? "Success" : "Failed"}
              </span>
              {config.lastTestMessage && ` (${config.lastTestMessage})`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
