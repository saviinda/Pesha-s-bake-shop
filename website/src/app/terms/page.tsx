import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">Terms of Service</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Acceptance of Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using Pesha's Bake Shop website, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Use License</h2>
              <p className="text-gray-600 leading-relaxed">
                Permission is granted to temporarily download one copy of the materials on Pesha's Bake Shop website for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Product Orders</h2>
              <p className="text-gray-600 leading-relaxed">
                All orders are subject to availability and confirmation. We reserve the right to refuse or cancel any order for any reason at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Delivery</h2>
              <p className="text-gray-600 leading-relaxed">
                Delivery times are estimates and not guaranteed. We are not responsible for delays caused by weather, traffic, or other circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Payment Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                Payment is due upon delivery unless otherwise specified. We accept cash and bank transfers for all orders.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Cancellation Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                Orders may be cancelled up to 24 hours before the scheduled delivery time. Cancellations made less than 24 hours before delivery may be subject to a cancellation fee.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                In no event shall Pesha's Bake Shop be liable for any damages arising out of the use or inability to use the materials on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                For questions about these Terms of Service, please contact us at admin@pesha.lk
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
