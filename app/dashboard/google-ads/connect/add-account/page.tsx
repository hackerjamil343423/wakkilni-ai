"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect to OAuth flow
 * Manual account ID entry is no longer supported for security.
 * Users must authenticate through Google's OAuth which returns
 * only the accounts they have access to.
 */
export default function AddAccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the OAuth authorize endpoint
    router.replace("/api/google-ads/oauth/authorize");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-zinc-300 border-t-zinc-600 rounded-full mx-auto" />
        <p className="text-sm text-zinc-500">Redirecting to Google...</p>
      </div>
    </div>
  );
}
