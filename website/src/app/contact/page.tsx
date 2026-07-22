'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, Clock, ChevronDown, ChevronUp, Heart, Sparkles, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/contact-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message })
      });
      
      if (response.ok) {
        setSubmitting(false);
        setSubmitted(true);
        setName('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitting(false);
      alert('Failed to send message. Please try again.');
    }
  };

  const faqs = [
    {
      question: "How far in advance should I place my order?",
      answer: "We recommend placing orders at least 24-48 hours in advance for standard items. For custom cakes and large orders, please contact us 3-5 days ahead to ensure availability."
    },
    {
      question: "Do you offer delivery services?",
      answer: "Yes, we deliver within Colombo and selected suburbs. Delivery fees vary based on location and order size. You can check delivery zones and fees during checkout."
    },
    {
      question: "Can I customize my cake design?",
      answer: "Absolutely! We specialize in custom designs. For custom cakes with specific themes, colors, or decorations, please contact us via WhatsApp or phone to discuss your requirements."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit/debit cards, bank transfers, and cash on delivery for eligible orders. All payments are processed securely through our platform."
    },
    {
      question: "Do you accommodate dietary restrictions?",
      answer: "Yes, we offer eggless and reduced-sugar options for many of our products. Please mention any dietary requirements when placing your order, and we'll do our best to accommodate."
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#130907] via-[#1d110e] to-[#130907]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80"
            alt="Contact Us"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#130907]/80 via-[#130907]/70 to-[#130907]/90" />
        </div>

        {/* Ambient Lights */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[#c5a880]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[#8c3a1b]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/30 bg-[#c5a880]/10 px-5 py-2 text-[10px] font-extrabold text-[#c5a880] tracking-widest uppercase shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get in Touch</span>
            </motion.div>
            
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-tight">
              We'd Love to <span className="text-[#c5a880] font-normal italic">Hear From You</span>
            </h1>
            
            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
              Have questions about our sweet creations, custom orders, or delivery? Reach out to us and let's make your celebration extra special.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="#contact-form"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-[#966750] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Send Message</span>
              </Link>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-20 bg-gradient-to-b from-[#faf8f5] to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Address Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl border border-border/60 shadow-luxury p-8 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <MapPin className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Our Location</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                Home Kitchen<br />
                Kaduwela, Colombo<br />
                Sri Lanka
              </p>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl border border-border/60 shadow-luxury p-8 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Phone className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Call Us</h3>
              <a href="tel:+94771234567" className="text-sm text-muted-foreground leading-relaxed font-semibold hover:text-primary transition-colors block">
                +94 (77) 123 4567
              </a>
              <p className="text-xs text-muted-foreground/60 mt-2 font-semibold">Mon-Sun: 8AM - 8PM</p>
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl border border-border/60 shadow-luxury p-8 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Email Us</h3>
              <a href="mailto:peshasbakes@gmail.com" className="text-sm text-muted-foreground leading-relaxed font-semibold hover:text-primary transition-colors block">
                peshasbakes@gmail.com
              </a>
              <p className="text-xs text-muted-foreground/60 mt-2 font-semibold">Response within 24 hours</p>
            </motion.div>

            {/* Business Hours Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl border border-border/60 shadow-luxury p-8 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-3">Business Hours</h3>
              <div className="text-sm text-muted-foreground leading-relaxed font-semibold space-y-1">
                <p>Monday - Sunday</p>
                <p className="text-primary font-extrabold">8:00 AM - 8:00 PM</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#faf8f6] to-white rounded-3xl border border-border/60 shadow-luxury p-8 sm:p-12"
            >
              <div className="mb-8">
                <h2 className="font-display text-3xl font-light text-foreground mb-3">Send Us a Message</h2>
                <p className="text-sm text-muted-foreground font-semibold leading-relaxed">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4"
                >
                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-emerald-900">Message Sent Successfully!</h3>
                  <p className="text-sm text-emerald-800 leading-relaxed font-semibold">
                    Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 py-3 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nimal Perera"
                        className="w-full rounded-xl border border-border/60 bg-white px-4 py-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nimal@gmail.com"
                        className="w-full rounded-xl border border-border/60 bg-white px-4 py-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all placeholder:text-muted-foreground/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full rounded-xl border border-border/60 bg-white px-4 py-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider">Your Message *</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your order or inquiry..."
                      rows={5}
                      className="w-full rounded-xl border border-border/60 bg-white px-4 py-3.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 font-semibold text-foreground transition-all resize-none placeholder:text-muted-foreground/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-[#a34d2b] hover:from-[#a34d2b] hover:to-primary py-4 text-xs font-extrabold uppercase tracking-widest text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </motion.div>

            {/* Google Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden shadow-luxury border border-border/60 h-full min-h-[500px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.123456789!2d79.9123456!3d6.9123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnNDQuNCJOIDc5wrA1NCc0NC40IkU!5e0!3m2!1sen!2slk!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-[#faf8f5] to-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-4xl font-light text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground font-semibold max-w-2xl mx-auto">
              Find answers to common questions about our products, ordering, and delivery.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#faf8f5]/50 transition-colors cursor-pointer"
                >
                  <span className="font-display text-sm font-bold text-foreground pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-5 pt-0"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed font-semibold">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#130907] via-[#1d110e] to-[#130907] relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1920&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#130907]/90 to-[#130907]/70" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-luxury-gold/30 bg-[#c5a880]/10 px-5 py-2 text-[10px] font-extrabold text-[#c5a880] tracking-widest uppercase shadow-sm">
              <Heart className="h-3.5 w-3.5 fill-[#c5a880]" />
              <span>Made with Love</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl font-light text-white leading-tight">
              Ready to Order Your <span className="text-[#c5a880] font-normal italic">Perfect Cake?</span>
            </h2>

            <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto leading-relaxed font-light">
              Browse our collection or get in touch for a custom creation. Let's make your celebration unforgettable.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-[#966750] px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
              >
                <span>Browse Menu</span>
              </Link>
              <a
                href="https://wa.me/94771234567"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all w-full sm:w-auto cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Custom Order</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
}
