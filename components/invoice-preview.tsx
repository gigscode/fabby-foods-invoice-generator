'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import { formatCurrency, calculateLineItemTotal, formatInvoiceTime, generatePDF } from '@/lib/pdf-utils';
import type { InvoiceFormData } from '@/lib/types';
import Image from 'next/image';

export interface InvoicePreviewProps {
  data: InvoiceFormData;
  onBack?: () => void;
}

export function InvoicePreview({ data, onBack }: InvoicePreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrintClick = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generatePDF(data, `Invoice-${data.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate totals
  const itemsWithTotals = data.items.map((item) => {
    const total = calculateLineItemTotal(item.quantity, item.rate);
    return { ...item, total };
  });

  const grandTotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Invoice */}
      <Card className="print:shadow-none print:border-0 shadow-xl">
        <CardContent className="p-0" id="invoice-content">
          <div className="bg-white p-6 sm:p-8 md:p-12" style={{ backgroundColor: '#ffffff' }}>
            {/* Header with Logo */}
            <div className="mb-8 pb-6" style={{ borderBottom: '4px solid #f97316' }}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg" style={{ border: '4px solid #f97316' }}>
                    <Image
                      src="/fabby.jpg"
                      alt="Fabby G International"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#111827' }}>
                      Fabby G International Limited
                    </h1>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#ea580c' }}>FabbyGinternational</p>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: '#ea580c' }}>INVOICE</h2>
                  <p className="text-sm mt-1" style={{ color: '#4b5563' }}>{data.invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Company & Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8">
              {/* From - Permanent Details */}
              <div className="p-4 sm:p-5 rounded-lg" style={{ backgroundColor: '#fff7ed', borderLeft: '4px solid #f97316' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#c2410c' }}>
                  From
                </p>
                <div className="text-sm space-y-1" style={{ color: '#1f2937' }}>
                  <p className="font-bold text-base" style={{ color: '#111827' }}>Fabby G International Limited</p>
                  <p className="font-semibold" style={{ color: '#c2410c' }}>Ayoola Odejayi</p>
                  <p className="font-medium">Acct No. 3021173586 (FirstBank)</p>
                  <p>Olora Layout along Housing Road Adebayo</p>
                  <p>Ado Ekiti, Ekiti</p>
                  <p className="font-semibold" style={{ color: '#111827' }}>08060808831</p>
                  <p className="font-medium">Nigeria</p>
                </div>
              </div>

              {/* To - Customer Details */}
              <div className="p-4 sm:p-5 rounded-lg" style={{ backgroundColor: '#f9fafb', borderLeft: '4px solid #9ca3af' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#374151' }}>
                  Bill To
                </p>
                <div className="text-sm space-y-1" style={{ color: '#1f2937' }}>
                  <p className="font-bold text-base" style={{ color: '#111827' }}>{data.toName}</p>
                  <p>{data.toAddress}</p>
                  <p>{data.toCity}</p>
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 p-4 rounded-lg" style={{ background: 'linear-gradient(to right, #fff7ed, #ffedd5)' }}>
              <div>
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#c2410c' }}>Invoice Date</p>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>
                  {new Date(data.invoiceDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase mb-1" style={{ color: '#c2410c' }}>Time</p>
                <p className="text-sm font-bold" style={{ color: '#111827' }}>{formatInvoiceTime(data.invoiceTime)}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(to right, #f97316, #ea580c)', color: '#ffffff' }}>
                    <th className="text-left p-3 font-bold rounded-tl-lg">#</th>
                    <th className="text-left p-3 font-bold">Item Description</th>
                    <th className="text-center p-3 font-bold">Qty</th>
                    <th className="text-right p-3 font-bold">Rate</th>
                    <th className="text-right p-3 font-bold rounded-tr-lg">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsWithTotals.map((item, index) => (
                    <tr
                      key={index}
                      style={{ 
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                      }}
                    >
                      <td className="p-3 font-medium" style={{ color: '#4b5563' }}>{index + 1}</td>
                      <td className="p-3 font-medium" style={{ color: '#1f2937' }}>{item.description}</td>
                      <td className="text-center p-3" style={{ color: '#1f2937' }}>{item.quantity}</td>
                      <td className="text-right p-3" style={{ color: '#1f2937' }}>
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="text-right p-3 font-semibold" style={{ color: '#111827' }}>
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-8">
              <div className="w-full sm:w-80">
                <div className="p-5 rounded-lg shadow-lg" style={{ background: 'linear-gradient(to right, #f97316, #ea580c)', color: '#ffffff' }}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">TOTAL</span>
                    <span className="font-bold text-2xl">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {data.notes && (
              <div className="mb-8 p-4 rounded" style={{ backgroundColor: '#fefce8', borderLeft: '4px solid #facc15' }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#854d0e' }}>
                  Notes
                </p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>{data.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-6 text-center" style={{ borderTop: '2px solid #e5e7eb' }}>
              <p className="text-sm font-semibold mb-2" style={{ color: '#ea580c' }}>
                It was great doing business with you.
              </p>
              <p className="text-xs" style={{ color: '#4b5563' }}>
                Terms & Conditions: Please make the payment by the due date.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Bottom */}
      <div className="flex flex-col sm:flex-row gap-2 print:hidden sticky bottom-4 z-10">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-6 text-sm font-medium border-2 bg-white shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form
          </Button>
        )}
        <Button
          onClick={handlePrintClick}
          variant="outline"
          className="flex-1 py-6 text-sm font-medium border-2 bg-white shadow-lg"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex-1 py-6 text-sm font-medium bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>
    </div>
  );
}
