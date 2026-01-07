import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Product and price configuration
const PRICES = {
  payPerCheck: "price_1Sn0lm4K8Nnge2bHApn35xdK",
  proMonthly: "price_1Sn0m44K8Nnge2bH560lgndW",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { priceType, email, couponCode } = await req.json();
    
    if (!priceType || !['payPerCheck', 'proMonthly'].includes(priceType)) {
      throw new Error("Invalid price type");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    const priceId = PRICES[priceType as keyof typeof PRICES];
    const isSubscription = priceType === 'proMonthly';

    // Build session config
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${req.headers.get("origin")}/payment-success?type=${priceType}`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      allow_promotion_codes: true,
    };

    // Apply coupon if provided
    if (couponCode && isSubscription) {
      try {
        // Verify coupon exists
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon) {
          sessionConfig.discounts = [{ coupon: couponCode }];
          sessionConfig.allow_promotion_codes = false; // Can't use both
        }
      } catch {
        console.log("Coupon not found, ignoring:", couponCode);
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout failed";
    console.error("Checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
