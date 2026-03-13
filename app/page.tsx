'use client';

import { useState } from 'react';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import type { InvoiceFormData } from '@/lib/types';

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);

  const handleGenerateInvoice = (data: InvoiceFormData) => {
    setInvoiceData(data);
  };

  const handleBackToForm = () => {
    setInvoiceData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 py-6 sm:py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            Invoice Generator
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Create professional invoices with Fabby Foods branding
          </p>
        </div>

        {invoiceData ? (
          // Preview Mode
          <div className="space-y-4">
            <button
              onClick={handleBackToForm}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              ← Back to Form
            </button>
            <InvoicePreview data={invoiceData} />
          </div>
        ) : (
          // Form Mode
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
              <InvoiceForm onSubmit={handleGenerateInvoice} />
            </div>
            <div className="lg:col-span-1">
              {/* Info Card */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-fit lg:sticky lg:top-8">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Help</h2>
                <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">1.</span>
                    <span>Fill in your company details (pre-filled with Fabby Foods)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">2.</span>
                    <span>Add customer information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">3.</span>
                    <span>Add line items with quantity, rate, and tax</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">4.</span>
                    <span>Add optional notes and terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold mt-0.5 flex-shrink-0">5.</span>
                    <span>Click Generate to preview and download</span>
                  </li>
                </ul>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Features</h3>
                  <ul className="space-y-1.5 sm:space-y-2 text-xs text-gray-600">
                    <li>✓ Professional invoice design</li>
                    <li>✓ Automatic tax calculation</li>
                    <li>✓ Download as PDF</li>
                    <li>✓ Print-friendly format</li>
                    <li>✓ Fabby Foods branding</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
