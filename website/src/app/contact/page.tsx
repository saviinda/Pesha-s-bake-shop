'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  return (
    <>
      <Navbar />
      
      <main className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Back link */}
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          {/* Heading */}
          <div className="text-center space-y-3">
            <h1 className="font-display text-4xl font-extrabold text-primary">Get in Touch</h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto font-medium">Have questions about order options, custom sizes, or delivery? Reach out to us!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Info Cards Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl border border-border/50 p-6 shadow-sm space-y-4">
                <h3 className="font-display text-lg font-bold text-primary">Bakery Contact Details</h3>
                
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Home Kitchen Location</p>
                      <p className="text-muted-foreground text-xs mt-0.5">Kaduwela, Colombo, Sri Lanka</p>
                    </div>
                  </div>

                  <a href="tel:+94771234567" className="flex gap-3 hover:text-primary transition-colors group">
                    <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Call Us Direct</p>
                      <p className="text-muted-foreground text-xs mt-0.5 group-hover:text-primary">+94 (77) 123 4567</p>
                    </div>
                  </a>

                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Email Inquiries</p>
                      <p className="text-muted-foreground text-xs mt-0.5">peshasbakes@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp direct chat box */}
              <div className="bg-emerald-50 rounded-3xl border border-emerald-200/50 p-6 shadow-sm space-y-4 text-center sm:text-left">
                <div className="h-10 w-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-600 mx-auto sm:mx-0">
                  <MessageCircle className="h-5 w-5 fill-emerald-600/15" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-900">Immediate Custom Assistance?</h4>
                  <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed font-semibold">
                    We suggest chatting with us directly on WhatsApp to confirm custom sponge layers or specific frosting color schemes.
                  </p>
                </div>
                <a
                  href="https://wa.me/94771234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>Start WhatsApp Chat</span>
                </a>
              </div>
            </div>

            {/* Inquiry Form Column */}
            <div className="md:col-span-7 bg-white rounded-3xl border border-border/50 p-6 sm:p-8 shadow-sm">
              <h3 className="font-display text-lg font-bold text-primary mb-6">Send a Message</h3>
              
              {submitted ? (
                <div className="rounded-2xl bg-amber-50 border border-primary/20 p-6 text-center space-y-3 animate-fadeIn">
                  <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-base font-extrabold text-primary">Message Submitted!</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Thank you for your inquiry. Our team will review and get back to you via phone or email as soon as possible.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-secondary transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nimal Perera"
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nimal@gmail.com"
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Inquiry Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write your details or custom cake requirements here..."
                      rows={4}
                      className="w-full rounded-xl border border-border bg-background/10 p-3 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-primary py-3.5 text-xs font-bold text-white hover:bg-secondary transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
