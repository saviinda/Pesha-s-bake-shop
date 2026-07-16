import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Privacy Policy</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Information Collection</h2>
              <p className="text-gray-600 leading-relaxed">
                We collect information you provide directly, including your name, email address, phone number, and delivery address when you place an order or create an account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Use of Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use your information to process orders, deliver products, communicate with you about your orders, and improve our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Data Security</h2>
              <p className="text-gray-600 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Sharing of Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Cookies</h2>
              <p className="text-gray-600 leading-relaxed">
                We use cookies to enhance your experience on our website. Cookies are small files stored on your device that remember your preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Your Rights</h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Changes to Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about this Privacy Policy, please contact us at admin@pesha.lk
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
