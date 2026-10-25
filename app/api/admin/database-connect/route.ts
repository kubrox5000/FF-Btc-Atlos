import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'
import { detectSsl } from '@/lib/db-ssl'
import { seedDatabase } from '@/lib/db-seed'

export const dynamic = 'force-dynamic'

// ── كل جمل SQL للـ migrations مرتبة بالترتيب ─────────────────────────────
const MIGRATION_SQL = `
-- 0000: جداول أساسية
CREATE TABLE IF NOT EXISTS "admins" (
  "id" serial PRIMARY KEY NOT NULL,
  "username" text NOT NULL,
  "password_hash" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "admins_username_unique" UNIQUE("username")
);

CREATE TABLE IF NOT EXISTS "coupons" (
  "id" serial PRIMARY KEY NOT NULL,
  "code" text NOT NULL,
  "discount_pct" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "used_count" integer DEFAULT 0 NOT NULL,
  "max_uses" integer,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "coupons_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "orders" (
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
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);

CREATE TABLE IF NOT EXISTS "packages" (
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
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "avatar" text,
  "rating" integer DEFAULT 5 NOT NULL,
  "comment" text NOT NULL,
  "country" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "data" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

-- 0001: حقول إضافية للـ reviews
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "country_code" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "package_label" text;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "verified" boolean DEFAULT true NOT NULL;

-- 0002: حقول إضافية للـ orders
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "country" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "phone" text;

-- 0003: جدول payment_methods
CREATE TABLE IF NOT EXISTS "payment_methods" (
  "id" serial PRIMARY KEY NOT NULL,
  "key" text NOT NULL,
  "label" text NOT NULL,
  "network" text DEFAULT '' NOT NULL,
  "cat" text DEFAULT 'wallet' NOT NULL,
  "icon" text DEFAULT 'usdt' NOT NULL,
  "wallet_address" text DEFAULT '' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "payment_methods_key_unique" UNIQUE("key")
);

INSERT INTO "payment_methods" ("key", "label", "network", "cat", "icon", "sort_order")
  VALUES
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
    ('REVOLUT', 'Revolut', 'Revolut Account', 'wallet', 'revolut', 14)
  ON CONFLICT ("key") DO NOTHING;

-- 0004: تصحيح category لـ Binance Pay
UPDATE "payment_methods" SET "cat" = 'wallet' WHERE "key" = 'BINANCE_PAY';
`.trim()

// ── اختبار الاتصال وجلب الجداول الموجودة ─────────────────────────────────
async function testConnection(url: string): Promise<{ ok: boolean; error?: string; tables?: string[] }> {
  try {
    const postgres = (await import('postgres')).default
    const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 10, ssl: detectSsl(url) })
    try {
      const rows = await sql<{ tablename: string }[]>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
      `
      await sql.end()
      return { ok: true, tables: rows.map((r) => r.tablename) }
    } catch (err) {
      await sql.end()
      throw err
    }
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ── تشغيل الـ migrations مباشرة بدون CLI ─────────────────────────────────
async function runMigrations(url: string): Promise<{ ok: boolean; error?: string }> {
  const postgres = (await import('postgres')).default
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15, ssl: detectSsl(url) })
  try {
    await sql.unsafe(MIGRATION_SQL)
    await sql.end()
    return { ok: true }
  } catch (err) {
    try { await sql.end() } catch { /* ignore */ }
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

// ── تحديث DATABASE_URL في ملف .env ───────────────────────────────────────
async function updateEnvFile(newUrl: string): Promise<void> {
  const envPath = path.join(process.cwd(), '.env')
  let content = ''
  try { content = await readFile(envPath, 'utf-8') } catch { content = '' }
  if (content.includes('DATABASE_URL=')) {
    content = content.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${newUrl}`)
  } else {
    content = content + `\nDATABASE_URL=${newUrl}\n`
  }
  await writeFile(envPath, content, 'utf-8')
}

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, action } = await req.json() as { url: string; action: 'test' | 'connect' | 'migrate' }

  if (!url || (!url.startsWith('postgresql://') && !url.startsWith('postgres://'))) {
    return NextResponse.json({ error: 'Invalid URL. Must start with postgresql://' }, { status: 400 })
  }

  // ── اختبار الاتصال فقط ────────────────────────────────────────────────
  if (action === 'test') {
    return NextResponse.json(await testConnection(url))
  }

  // ── تشغيل الـ migrations على URL الحالي (بدون تغيير الاتصال) ──────────
  if (action === 'migrate') {
    const result = await runMigrations(url)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ ok: true, message: 'Database tables created successfully.' })
  }

  // ── ربط قاعدة بيانات جديدة: اختبار ثم migration ثم تعبئة ثم حفظ ───────
  const testResult = await testConnection(url)
  if (!testResult.ok) {
    return NextResponse.json({ error: `Cannot connect: ${testResult.error}` }, { status: 400 })
  }

  const migrateResult = await runMigrations(url)
  if (!migrateResult.ok) {
    return NextResponse.json({
      error: `Connected but migration failed: ${migrateResult.error}`,
    }, { status: 500 })
  }

  // ── تعبئة تلقائية بالباقات والتعليقات والكوبونات والمدير ──────────────
  try {
    await seedDatabase(url)
  } catch (err) {
    return NextResponse.json({
      error: `Tables created but seeding failed: ${err instanceof Error ? err.message : String(err)}`,
    }, { status: 500 })
  }

  process.env.DATABASE_URL = url
  try {
    await updateEnvFile(url)
  } catch {
    // في بيئة الإنتاج لا يمكن الكتابة للـ .env — هذا متوقع
  }

  return NextResponse.json({
    ok: true,
    tables: testResult.tables,
    message: 'Connected. Tables created and filled with packages, reviews, coupons & default settings.',
  })
}
