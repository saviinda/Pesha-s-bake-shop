'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Cake, Mail, Lock, Phone, User, AlertCircle,
  CheckCircle2, RefreshCw, ArrowRight, ShieldCheck
} from 'lucide-react';
import { loginCustomer, signupCustomer, getCurrentCustomer } from '@/lib/data';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── OTP 6-box input component ─────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const focus = (i: number) => inputs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, idx) => (idx === i ? '' : d));
      onChange(next.join(''));
      if (i > 0) setTimeout(() => focus(i - 1), 0);
    } else if (e.key === 'ArrowLeft' && i > 0) {
      focus(i - 1);
    } else if (e.key === 'ArrowRight' && i < 5) {
      focus(i + 1);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const char = raw[raw.length - 1];
    const next = digits.map((d, idx) => (idx === i ? char : d));
    onChange(next.join(''));
    if (i < 5) setTimeout(() => focus(i + 1), 0);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const padded = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    onChange(padded.join(''));
    const lastFilled = Math.min(pasted.length, 5);
    setTimeout(() => focus(lastFilled), 0);
  };

  return (
    <div className="flex items-center justify-center gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onFocus={e => e.target.select()}
          className={`h-14 w-12 rounded-2xl border-2 text-center text-xl font-black transition-all outline-none
            ${d
              ? 'border-primary bg-primary/5 text-primary shadow-sm'
              : 'border-border bg-white text-foreground'
            }
            focus:border-primary focus:ring-4 focus:ring-primary/10`}
        />
      ))}
    </div>
  );
}

// ─── Main login content ────────────────────────────────────────────────────
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';
  const tabParam  = searchParams.get('tab');

  const [isLogin, setIsLogin]     = useState(tabParam !== 'signup');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [phone, setPhone]         = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  // OTP verification state
  const [otpEmail, setOtpEmail]       = useState('');
  const [otpCode, setOtpCode]         = useState('');
  const [otpError, setOtpError]       = useState('');
  const [otpLoading, setOtpLoading]   = useState(false);
  const [otpSuccess, setOtpSuccess]   = useState(false);
  const [resending, setResending]     = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showOtp, setShowOtp]         = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [timeLeft, setTimeLeft]       = useState(600); // 10 min in seconds

  // Redirect if already logged in
  useEffect(() => {
    if (getCurrentCustomer()) router.push(redirect);
  }, [router, redirect]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!showOtp) return;
    setTimeLeft(600);
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showOtp]);

  // Resend cooldown countdown
  useEffect(() => {
    if (!resendCooldown) return;
    const t = setInterval(() => setResendCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ── Send OTP email ──────────────────────────────────────────────
  const sendOtpEmail = async (toEmail: string, toName: string, code: string) => {
    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#fdf8f4;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f4;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);max-width:600px;width:100%;">
<tr><td style="background:linear-gradient(135deg,#b5673d 0%,#d4845a 100%);padding:40px;text-align:center;">
  <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.75);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Email Verification</p>
  <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;">🎂 Pesha's Bake Shop</h1>
</td></tr>
<tr><td style="padding:40px;">
  <h2 style="margin:0 0 8px;color:#5c3d2e;font-size:22px;font-weight:700;">Hello, ${toName}! 👋</h2>
  <p style="margin:0 0 28px;color:#7a5c4a;font-size:15px;line-height:1.7;">Use the code below to verify your email address. This code expires in <strong>10 minutes</strong>.</p>
  <div style="background:#fdf8f4;border:2px dashed #d4845a;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
    <p style="margin:0 0 8px;font-size:12px;color:#a0856d;font-weight:700;text-transform:uppercase;letter-spacing:2px;">Your Verification Code</p>
    <p style="margin:0;font-size:48px;font-weight:900;letter-spacing:12px;color:#b5673d;font-family:monospace;">${code}</p>
  </div>
  <p style="margin:0;color:#c4a992;font-size:12px;line-height:1.6;text-align:center;">Enter this code on the Pesha's Bake Shop sign-up page.<br/>If you didn't create this account, ignore this email.</p>
</td></tr>
<tr><td style="background:#fdf8f4;padding:24px 40px;text-align:center;border-top:1px solid #f0e8e0;">
  <p style="margin:0;font-size:11px;color:#c4a992;">© ${new Date().getFullYear()} Pesha's Bake Shop · Made with 💛 in Sri Lanka</p>
</td></tr>
</table></td></tr></table>
</body></html>`;

    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: toEmail,
        subject: `${code} is your Pesha's Bake Shop verification code`,
        html,
      }),
    });
  };

  // ── Submit sign-in / sign-up ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginCustomer(email, password);
        if (res.success) {
          router.push(redirect);
          router.refresh();
        } else if (res.needsVerification) {
          setNeedsVerification(true);
          setOtpEmail(email);
          setShowOtp(true);
        } else {
          setError(res.message);
        }
      } else {
        if (!phone || !firstName) {
          setError('Please fill in all required fields.');
          setLoading(false);
          return;
        }
        const res = await signupCustomer(email, password, phone, firstName, lastName);
        if (res.success && res.requiresVerification && res.verificationCode) {
          try {
            await sendOtpEmail(email, firstName, res.verificationCode);
          } catch (_) { /* don't block signup */ }
          setOtpEmail(email);
          setShowOtp(true);
        } else if (res.success) {
          router.push(redirect);
          router.refresh();
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP code ────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }
    setOtpError('');
    setOtpLoading(true);

    try {
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSuccess(true);
        // Auto-login after verification
        setTimeout(async () => {
          const loginRes = await loginCustomer(email || otpEmail, password);
          if (loginRes.success) {
            router.push(redirect);
            router.refresh();
          } else {
            // If password not available (came from login's unverified state), go to login
            router.push('/login');
          }
        }, 1500);
      } else if (data.expired) {
        setOtpError('Code expired. Please request a new one.');
      } else {
        setOtpError(data.message || 'Invalid code. Please try again.');
      }
    } catch (_) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setOtpError('');
    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (data.newCode) {
        await sendOtpEmail(otpEmail, firstName || otpEmail.split('@')[0], data.newCode);
      }
      setOtpCode('');
      setTimeLeft(600);
      setResendCooldown(60);
    } catch (_) {
      setOtpError('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // ── OTP verification screen ────────────────────────────────────
  if (showOtp) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm space-y-6">
          {otpSuccess ? (
            /* Success state */
            <div className="text-center space-y-4 py-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mx-auto">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="font-display text-2xl font-black text-emerald-700">Email Verified! 🎉</h2>
              <p className="text-sm text-muted-foreground">Your account is now active. Signing you in…</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h1 className="font-display text-2xl font-black text-primary">
                  {needsVerification ? 'Verify Your Email' : 'Enter Verification Code'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-bold text-primary">{otpEmail}</p>
              </div>

              {/* Timer */}
              {timeLeft > 0 ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Code expires in <span className="font-bold text-foreground tabular-nums">{fmtTime(timeLeft)}</span>
                </div>
              ) : (
                <div className="text-center text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl py-2">
                  ⏱ Code expired — please request a new one
                </div>
              )}

              {/* OTP boxes form */}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <OtpInput value={otpCode} onChange={setOtpCode} />

                {otpError && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    {otpError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6 || timeLeft === 0}
                  className="w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {otpLoading
                    ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
                    : <><ShieldCheck className="h-4 w-4" /> Verify Email</>}
                </button>
              </form>

              {/* Resend */}
              <div className="text-center space-y-1.5 border-t border-border/50 pt-4">
                <p className="text-xs text-muted-foreground">Didn't receive the code? Check your spam folder.</p>
                {resendCooldown > 0 ? (
                  <p className="text-xs font-semibold text-muted-foreground">
                    Resend in <span className="tabular-nums">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mx-auto disabled:opacity-50"
                  >
                    {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    {resending ? 'Sending new code…' : 'Resend code'}
                  </button>
                )}
                <button
                  onClick={() => { setShowOtp(false); setOtpCode(''); setOtpError(''); setNeedsVerification(false); setIsLogin(true); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto mt-1"
                >
                  <ArrowRight className="h-3 w-3 rotate-180" /> Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Standard login / signup form ──────────────────────────────
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cake className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-black text-primary">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">
            {isLogin
              ? 'Log in to order delicious cakes and track deliveries'
              : 'Register to unlock our checkout system'}
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                      placeholder="Savi"
                      className="w-full rounded-xl border border-border bg-background/10 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary/50 transition-colors" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Indula"
                    className="w-full rounded-xl border border-border bg-background/10 py-2.5 px-4 text-xs outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="0771234567"
                    className="w-full rounded-xl border border-border bg-background/10 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary/50 transition-colors" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="savi@codezela.lk"
                className="w-full rounded-xl border border-border bg-background/10 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" minLength={6}
                className="w-full rounded-xl border border-border bg-background/10 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary/50 transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full rounded-full bg-primary py-3 text-xs font-bold text-white shadow-md hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
            {loading
              ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
              : <span>{isLogin ? 'Sign In' : 'Sign Up & Create Account'}</span>}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border/50 text-xs font-medium text-muted-foreground">
          {isLogin ? (
            <p>Don't have an account?{' '}
              <button onClick={() => { setIsLogin(false); setError(''); }} className="text-primary font-bold hover:underline">Sign Up</button>
            </p>
          ) : (
            <p>Already have an account?{' '}
              <button onClick={() => { setIsLogin(true); setError(''); }} className="text-primary font-bold hover:underline">Sign In</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-8 flex items-center">
        <Suspense fallback={
          <div className="flex mx-auto h-[40vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }>
          <LoginContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
