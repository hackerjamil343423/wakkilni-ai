/**
 * Payment Checkout API Route
 * Unified checkout endpoint that auto-selects provider based on user location
 */

import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/payment/service";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { productId, slug, provider } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    let result;

    // If provider is specified, use it; otherwise auto-detect
    if (provider) {
      result = await PaymentService.createCheckoutWithProvider(provider, {
        productId,
        slug,
      });
    } else {
      result = await PaymentService.createCheckout({
        productId,
        slug,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Checkout failed",
      },
      { status: 500 }
    );
  }
}
