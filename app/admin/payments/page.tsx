/**
 * Admin Payment Configuration Page
 * Manages payment provider settings
 */

import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentProviderList from "./components/payment-provider-list";

export default function AdminPaymentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Manage payment providers, credentials, and webhook settings
        </p>
      </div>

      <Suspense fallback={<PaymentConfigSkeleton />}>
        <PaymentProviderList />
      </Suspense>
    </div>
  );
}

function PaymentConfigSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
