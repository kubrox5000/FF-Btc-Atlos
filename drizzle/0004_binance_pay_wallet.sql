-- Move Binance Pay from 'crypto' category to 'wallet' category
UPDATE "payment_methods"
SET "cat" = 'wallet'
WHERE "key" = 'BINANCE_PAY';
