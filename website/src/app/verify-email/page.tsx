'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, Mail, RefreshCw, ArrowRight, Cake } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type Status = 'success' | 'invalid' | 'expired' | 'error' | 'already' | 'pending' | null;

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  useEffect(() => {
    const s = searchParams.get('status') as Status;
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (emailParam) setResendEmail(decodeURIComponent(emailParam));

    if (s) {
      setStatus(s);
    } else if (token) {
      // Local mode: mark localStorage token verified (server-safe for Vercel)
      if (typeof window !== 'undefined') {
        try {
          const pending = JSON.parse(localStorage.getItem('peshas_pending_verification') || '{}');
          if (pending[token]) {
            const localCusts = JSON.parse(localStorage.getItem('peshas_local_customers') || '[]');
            const idx = localCusts.findIndex((c: any) => c.verification_token === token);
            if (idx !== -1) {
              localCusts[idx].email_verified = true;
              localCusts[idx].verification_token = null;
              localStorage.setItem('peshas_local_customers', JSON.stringify(localCusts));
              delete pending[token];
              localStorage.setItem('peshas_pending_verification', JSON.stringify(pending));
            }
            setStatus('success');
          } else {
            setStatus('invalid');
          }
        } catch (e) {
          console.warn('localStorage verification failed:', e);
          setStatus('error');
        }
      }
    } else {
      setStatus('pending');
    }
  }, [searchParams]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResending(true);
    try {
      await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail }),
      });
      setResendDone(true);
    } catch (_) {
      setResendDone(true);
    } finally {
      setResending(false);
    }
  };

  const configs: Record<NonNullable<Status>, {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
    bg: string;
    action?: React.ReactNode;
  }> = {
    success: {
      icon: <CheckCircle2 className="h-14 w-14 text-emerald-500" />,
      title: '✅ Email Verified!',
      subtitle: 'Your account is now active. You can sign in and start ordering delicious cakes.',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      action: (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-secondary transition-all shadow-md"
        >
          Sign In Now <ArrowRight className="h-4 w-4" />
        </Link>
      ),
    },
    already: {
      icon: <CheckCircle2 className="h-14 w-14 text-blue-500" />,
      title: 'Already Verified',
      subtitle: 'Your email address is already verified. Sign in to access your account.',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      action: (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-secondary transition-all shadow-md"
        >
          Sign In <ArrowRight className="h-4 w-4" />
        </Link>
      ),
    },
    expired: {
      icon: <Clock className="h-14 w-14 text-amber-500" />,
      title: 'Link Expired',
      subtitle: 'This verification link has expired. Request a new one below.',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      action: resendDone ? (
        <p className="text-sm font-semibold text-emerald-700">✅ New verification email sent! Check your inbox.</p>
      ) : (
        <div className="space-y-3 w-full max-w-xs mx-auto">
          <input
            type="email"
            value={resendEmail}
            onChange={e => setResendEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={handleResend}
            disabled={resending || !resendEmail}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50 transition-all"
          >
            {resending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {resending ? 'Sending…' : 'Resend Verification Email'}
          </button>
        </div>
      ),
    },
    invalid: {
      icon: <XCircle className="h-14 w-14 text-rose-500" />,
      title: 'Invalid Link',
      subtitle: 'This verification link is not valid or has already been used.',
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      action: (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-foreground hover:bg-muted/30 transition-all"
        >
          Back to Login
        </Link>
      ),
    },
    error: {
      icon: <XCircle className="h-14 w-14 text-rose-500" />,
      title: 'Verification Failed',
      subtitle: 'Something went wrong on our end. Please try again or contact support.',
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
      action: (
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-secondary transition-all"
        >
          Back to Login
        </Link>
      ),
    },
    pending: {
      icon: <Mail className="h-14 w-14 text-primary" />,
      title: 'Check Your Inbox! 📬',
      subtitle: "We've sent a verification email. Click the link inside to activate your account.",
      color: 'text-primary',
      bg: 'bg-primary/5 border-primary/20',
      action: (
        <div className="space-y-2 text-center">
          <p className="text-xs text-muted-foreground">Didn't receive it? Check your spam folder.</p>
          {resendEmail && (
            resendDone ? (
              <p className="text-xs font-semibold text-emerald-700">✅ Resent! Check your inbox.</p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mx-auto"
              >
                {resending ? <RefreshCw className="h-3 w-3 animate-spin" /> : null}
                {resending ? 'Sending…' : 'Resend email'}
              </button>
            )
          )}
        </div>
      ),
    },
  };

  const cfg = status ? configs[status] : null;

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="bg-white rounded-3xl border border-border p-8 shadow-sm text-center space-y-6">
        {/* Logo */}
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Cake className="h-6 w-6" />
        </div>

        {!cfg ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground font-medium">Verifying your email…</p>
          </div>
        ) : (
          <>
            {/* Status icon */}
            <div className="flex justify-center">
              {cfg.icon}
            </div>

            {/* Status message */}
            <div className={`rounded-2xl border p-5 ${cfg.bg}`}>
              <h1 className={`font-display text-xl font-black ${cfg.color} mb-2`}>
                {cfg.title}
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cfg.subtitle}
              </p>
            </div>

            {/* Action */}
            {cfg.action && (
              <div className="flex flex-col items-center gap-3">
                {cfg.action}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-8 flex items-center">
        <Suspense fallback={
          <div className="flex mx-auto h-[40vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
