ALTER TABLE "subscription" ADD COLUMN "paymentProvider" text DEFAULT 'polar' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "paymobIntentionId" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "paymobSubscriptionPlanId" integer;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "paymobCustomerId" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "preferredLanguage" text DEFAULT 'en' NOT NULL;