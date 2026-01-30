/**
 * Payment Provider List Component
 * Displays all payment provider configurations
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PaymentProviderCard from "./payment-provider-card";

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

async function getPaymentConfigs(): Promise<PaymentConfigData[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/admin/payments/config`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payment configurations");
    }

    const data = await response.json();
    return data.configs || [];
  } catch {
    return [];
  }
}

const PROVIDER_INFO: Record<string, { name: string; description: string; color: string }> = {
  polar: {
    name: "Polar",
    description: "International payments (US, EU)",
    color: "bg-blue-500",
  },
  paymob: {
    name: "Paymob",
    description: "KSA/GCC payments (Card, MADA, Tabby, Tamara)",
    color: "bg-green-500",
  },
  streampay: {
    name: "Streampay",
    description: "KSA/GCC payments (SAR)",
    color: "bg-purple-500",
  },
};

export default async function PaymentProviderList() {
  const configs = await getPaymentConfigs();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payment Providers</h2>
          <p className="text-sm text-muted-foreground">
            {configs.filter((c) => c.enabled).length} of {configs.length} providers enabled
          </p>
        </div>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No payment providers configured</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {configs
            .sort((a, b) => b.priority - a.priority)
            .map((config) => {
              const info = PROVIDER_INFO[config.provider];
              return (
                <Card key={config.id} className={config.enabled ? "" : "opacity-60"}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{info?.name || config.provider}</CardTitle>
                          <Badge variant={config.enabled ? "default" : "secondary"}>
                            {config.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                          {config.sandboxMode && (
                            <Badge variant="outline" className="text-xs">
                              Sandbox
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className={`text-white ${info?.color || "bg-gray-500"}`}
                          >
                            Priority: {config.priority}
                          </Badge>
                        </div>
                        <CardDescription>{info?.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <PaymentProviderCard config={config} providerInfo={info} />
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}
