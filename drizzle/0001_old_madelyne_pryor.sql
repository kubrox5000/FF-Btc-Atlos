ALTER TABLE "reviews" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "country_code" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "package_label" text;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "verified" boolean DEFAULT true NOT NULL;