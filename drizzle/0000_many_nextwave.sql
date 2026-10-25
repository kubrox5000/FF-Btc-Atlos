CREATE TABLE "admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"discount_pct" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"max_uses" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"package_id" integer NOT NULL,
	"diamonds" integer NOT NULL,
	"player_uid" text NOT NULL,
	"nickname" text,
	"server" text DEFAULT 'Global' NOT NULL,
	"email" text,
	"amount_usd" numeric(10, 2) NOT NULL,
	"amount_usdt" numeric(10, 2) NOT NULL,
	"payment_method" text DEFAULT 'USDT_TRC20' NOT NULL,
	"wallet_address" text,
	"tx_id" text,
	"proof_url" text,
	"coupon_code" text,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"diamonds" integer NOT NULL,
	"bonus_diamonds" integer DEFAULT 0 NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"price_usdt" numeric(10, 2) NOT NULL,
	"discount_pct" integer DEFAULT 0 NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"flash_sale" boolean DEFAULT false NOT NULL,
	"delivery_eta" text DEFAULT '1-5 minutes' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text NOT NULL,
	"country" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
