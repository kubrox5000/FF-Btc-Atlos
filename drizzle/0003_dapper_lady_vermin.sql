CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"network" text DEFAULT '' NOT NULL,
	"cat" text DEFAULT 'wallet' NOT NULL,
	"icon" text DEFAULT 'usdt' NOT NULL,
	"wallet_address" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_methods_key_unique" UNIQUE("key")
);

INSERT INTO "payment_methods" ("key", "label", "network", "cat", "icon", "sort_order") VALUES
  ('USDT_TRC20', 'USDT (TRC20)', 'Tron Network', 'crypto', 'usdt', 1),
  ('USDT_BEP20', 'USDT (BEP20)', 'BNB Smart Chain', 'crypto', 'usdt', 2),
  ('BINANCE_PAY', 'Binance Pay', 'Binance App', 'wallet', 'binance', 3),
  ('BTC', 'BTC', 'Bitcoin Network', 'crypto', 'btc', 4),
  ('ETH', 'ETH', 'Ethereum Network', 'crypto', 'eth', 5),
  ('BNB', 'BNB', 'BNB Smart Chain', 'crypto', 'bnb', 6),
  ('USDC', 'USDC', 'Ethereum Network', 'crypto', 'usdc', 7),
  ('WISE', 'Wise', 'Wise Account', 'wallet', 'wise', 8),
  ('PAYONEER', 'Payoneer', 'Payoneer Account', 'wallet', 'payoneer', 9),
  ('SKRILL', 'Skrill', 'Skrill Account', 'wallet', 'skrill', 10),
  ('NETELLER', 'Neteller', 'Neteller Account', 'wallet', 'neteller', 11),
  ('REDOTPAY', 'RedotPay', 'RedotPay', 'wallet', 'redotpay', 12),
  ('BYBIT', 'Bybit', 'Bybit Account', 'wallet', 'bybit', 13),
  ('REVOLUT', 'Revolut', 'Revolut Account', 'wallet', 'revolut', 14);
