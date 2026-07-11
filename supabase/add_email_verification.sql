-- Run this in your Supabase SQL Editor
-- Adds email verification columns (OTP code-based) to customers table

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_code TEXT,
  ADD COLUMN IF NOT EXISTS verification_code_expires_at TIMESTAMP WITH TIME ZONE;

-- Pre-verify seed/demo customers so they can still log in
UPDATE public.customers
SET email_verified = TRUE
WHERE email IN ('savi@codezela.lk', 'amara@gmail.com', 'dilshan@outlook.com');
