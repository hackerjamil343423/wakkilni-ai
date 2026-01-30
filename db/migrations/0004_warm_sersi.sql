CREATE TABLE "payment_config" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"supported_countries" text,
	"sandbox_mode" boolean DEFAULT true NOT NULL,
	"api_public_key" text,
	"api_secret_key" text,
	"webhook_url" text,
	"webhook_secret" text,
	"webhook_events" text,
	"last_tested_at" timestamp,
	"last_test_status" text,
	"last_test_message" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_config_provider_unique" UNIQUE("provider")
);
--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "streampaySubscriptionId" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "streampayConsumerId" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "streampayPaymentLinkId" text;