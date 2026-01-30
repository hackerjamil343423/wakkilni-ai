/**
 * Payment Provider Form Component
 * Full settings form for editing payment provider configuration
 */

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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

interface Props {
  config: PaymentConfigData;
  onClose: () => void;
}

const PROVIDER_INFO: Record<string, { name: string; description: string }> = {
  polar: {
    name: "Polar",
    description: "International payments (US, EU) - Credit Card, Debit Card, Apple Pay, Google Pay",
  },
  paymob: {
    name: "Paymob",
    description: "KSA/GCC payments - Card, MADA, Tabby, Tamara, Apple Pay, Google Pay, stcPay",
  },
  streampay: {
    name: "Streampay",
    description: "KSA/GCC payments (SAR) - Payment links with recurring support",
  },
};

export default function PaymentProviderForm({ config, onClose }: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");

  // Form state
  const [priority, setPriority] = useState(config.priority);
  const [enabled, setEnabled] = useState(config.enabled);
  const [sandboxMode, setSandboxMode] = useState(config.sandboxMode);
  const [supportedCountries, setSupportedCountries] = useState(
    config.supportedCountries?.join(", ") || ""
  );

  // Credentials state
  const [apiKey, setApiKey] = useState(config.apiPublicKey || "");
  const [apiSecret, setApiSecret] = useState(""); // Don't show existing secret
  const [showSecret, setShowSecret] = useState(false);

  // Webhook state
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || "");
  const [webhookSecret, setWebhookSecret] = useState(""); // Don't show existing secret

  // Test state
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  const providerInfo = PROVIDER_INFO[config.provider];

  const handleSaveGeneral = async () => {
    startTransition(async () => {
      const countries = supportedCountries
        .split(",")
        .map((c) => c.trim().toUpperCase())
        .filter(Boolean);

      const response = await fetch(
        `/api/admin/payments/config/${config.provider}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled,
            priority,
            sandboxMode,
            supportedCountries: countries.length > 0 ? countries : undefined,
          }),
        }
      );

      if (response.ok) {
        toast.success("Configuration updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update configuration");
      }
    });
  };

  const handleSaveCredentials = async () => {
    startTransition(async () => {
      const body: Record<string, string> = {};
      if (apiKey) body.publicKey = apiKey;
      if (apiSecret) body.secretKey = apiSecret;

      if (Object.keys(body).length === 0) {
        toast.error("Please enter at least one field");
        return;
      }

      const response = await fetch(
        `/api/admin/payments/config/${config.provider}/credentials`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        toast.success("Credentials updated successfully");
        setApiSecret("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update credentials");
      }
    });
  };

  const handleSaveWebhook = async () => {
    startTransition(async () => {
      if (!webhookUrl || !webhookSecret) {
        toast.error("Please enter both webhook URL and secret");
        return;
      }

      const response = await fetch(
        `/api/admin/payments/config/${config.provider}/webhook`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            webhookUrl,
            webhookSecret,
          }),
        }
      );

      if (response.ok) {
        toast.success("Webhook configuration updated successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update webhook configuration");
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

      if (data.result.success) {
        toast.success("Connection test successful");
      } else {
        toast.error("Connection test failed");
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Connection test failed",
      });
      toast.error("Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onClose} className="mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Overview
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{providerInfo.name} Settings</CardTitle>
          <CardDescription>{providerInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="webhook">Webhook</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="form-enabled"
                    checked={enabled}
                    onCheckedChange={setEnabled}
                    disabled={isPending}
                  />
                  <Label htmlFor="form-enabled">Enabled</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, this provider will be available for checkout
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  disabled={isPending}
                />
                <p className="text-sm text-muted-foreground">
                  Higher priority providers are preferred when multiple are available
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="form-sandbox"
                    checked={sandboxMode}
                    onCheckedChange={setSandboxMode}
                    disabled={isPending}
                  />
                  <Label htmlFor="form-sandbox">Sandbox Mode</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, uses test environment instead of production
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="countries">Supported Countries</Label>
                <Textarea
                  id="countries"
                  placeholder="SA, AE, KW, QA, BH, OM"
                  value={supportedCountries}
                  onChange={(e) => setSupportedCountries(e.target.value)}
                  disabled={isPending}
                />
                <p className="text-sm text-muted-foreground">
                  Comma-separated list of ISO country codes (e.g., SA, AE, US)
                </p>
              </div>

              <Button onClick={handleSaveGeneral} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  These credentials are encrypted before storage. Never share your API secrets.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / Public Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder={config.apiPublicKey ? "••••••••" : "Enter API key"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiSecret"
                    type={showSecret ? "text" : "password"}
                    placeholder="Enter new API secret (leave blank to keep current)"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    disabled={isPending}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave blank to keep existing secret
                </p>
              </div>

              <Button onClick={handleSaveCredentials} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Credentials"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="webhook" className="space-y-4 mt-4">
              <Alert>
                <AlertDescription>
                  Webhook URL and secret are used to verify incoming payment notifications.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://your-domain.com/api/payment/webhooks/streampay"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookSecret">Webhook Secret</Label>
                <Input
                  id="webhookSecret"
                  type="password"
                  placeholder="Enter webhook secret"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  disabled={isPending}
                />
                <p className="text-sm text-muted-foreground">
                  Used to verify webhook signatures
                </p>
              </div>

              <Button onClick={handleSaveWebhook} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Webhook Config"
                )}
              </Button>
            </TabsContent>

            <TabsContent value="test" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Button
                  onClick={handleTestConnection}
                  disabled={testing || !enabled}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>

                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="font-medium">
                        {testResult.success ? "Connection Successful" : "Connection Failed"}
                      </div>
                      <div className="text-sm mt-1">{testResult.message}</div>
                    </AlertDescription>
                  </Alert>
                )}

                {config.lastTestStatus && (
                  <div className="text-sm text-muted-foreground">
                    <div>Last tested:{" "}
                      {config.lastTestedAt
                        ? new Date(config.lastTestedAt).toLocaleString()
                        : "Never"}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      Status:{" "}
                      <Badge variant={config.lastTestStatus === "success" ? "default" : "destructive"}>
                        {config.lastTestStatus === "success" ? "Success" : "Failed"}
                      </Badge>
                      {config.lastTestMessage && (
                        <span>({config.lastTestMessage})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
