'use client';

import { useState } from 'react';
import { InvoiceForm } from '@/components/invoice-form';
import { InvoicePreview } from '@/components/invoice-preview';
import type { InvoiceFormData } from '@/lib/types';
import Image from 'next/image';

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceFormData | null>(null);

  const handleGenerateInvoice = (data: InvoiceFormData) => {
    setInvoiceData(data);
  };

  const handleBackToForm = () => {
    setInvoiceData(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-4 sm:py-8 px-4">
      {/* Header */}
      {!invoiceData && (
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg">
              <Image
                src="/fabby.jpg"
                alt="Fabby G International"
                fill
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Invoice Generator
              </h1>
              <p className="text-sm sm:text-base text-orange-600 font-medium">
                Fabby G International
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Create professional invoices quickly and easily
          </p>
        </div>
      )}

      {invoiceData ? (
        <InvoicePreview data={invoiceData} onBack={handleBackToForm} />
      ) : (
        <InvoiceForm onSubmit={handleGenerateInvoice} />
      )}
    </main>
  );
}
