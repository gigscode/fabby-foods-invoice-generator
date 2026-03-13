'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { formatCurrency, calculateLineItemTotal, calculateTaxAmount } from '@/lib/pdf-utils';
import { generatePDF } from '@/lib/pdf-utils';
import type { InvoiceFormData } from '@/lib/types';

export interface InvoicePreviewProps {
  data: InvoiceFormData;
}

export function InvoicePreview({ data }: InvoicePreviewProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePrintClick = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generatePDF('invoice-content', `Invoice-${data.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Calculate totals
  const itemsWithTotals = data.items.map((item) => {
    const subtotal = calculateLineItemTotal(item.quantity, item.rate);
    const tax = calculateTaxAmount(subtotal, item.tax);
    const total = subtotal + tax;
    return { ...item, subtotal, tax, total };
  });

  const grandSubtotal = itemsWithTotals.reduce((sum, item) => sum + item.subtotal, 0);
  const grandTax = itemsWithTotals.reduce((sum, item) => sum + item.tax, 0);
  const grandTotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 print:hidden">
        <Button
          onClick={handlePrintClick}
          variant="outline"
          className="flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print / Save as PDF
        </Button>
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="flex-1 py-2 sm:py-3 text-xs sm:text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
        </Button>
      </div>

      {/* Invoice */}
      <Card className="print:shadow-none print:border-0">
        <CardContent className="p-0" id="invoice-content">
          <div className="bg-white p-4 sm:p-6 md:p-8 min-h-screen flex flex-col">
            {/* Header with Logo */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <img
                  src="/fabby-foods-logo.jpg"
                  alt="Fabby Foods"
                  className="h-16 sm:h-20 md:h-24 object-contain"
                />
              </div>
              <div className="text-center border-b-2 border-orange-400 pb-3 sm:pb-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600" style={{ fontFamily: 'Georgia, serif' }}>
                  INVOICE
                </h1>
              </div>
            </div>

            {/* Invoice Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm">
              <div>
                <p className="text-gray-600 font-semibold text-xs">INVOICE #</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{data.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">DATE</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {new Date(data.invoiceDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold text-xs">DUE DATE</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {new Date(data.dueDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* From & To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-8">
              {/* From */}
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
                  From
                </p>
                <div className="text-xs sm:text-sm text-gray-800 space-y-0.5">
                  <p className="font-bold text-sm sm:text-lg">{data.fromCompany}</p>
                  <p>{data.fromAddress}</p>
                  <p>{data.fromCity}</p>
                  <p className="font-semibold">{data.fromPhone}</p>
                </div>
              </div>

              {/* To */}
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">
                  Bill To
                </p>
                <div className="text-xs sm:text-sm text-gray-800 space-y-0.5">
                  <p className="font-bold text-sm sm:text-lg">{data.toName}</p>
                  <p>{data.toAddress}</p>
                  <p>{data.toCity}</p>
                  <p className="break-all">{data.toEmail}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6 sm:mb-8 flex-1 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="bg-orange-50 border-b-2 border-orange-400">
                    <th className="text-left p-2 sm:p-3 font-bold text-orange-900">Description</th>
                    <th className="text-center p-2 sm:p-3 font-bold text-orange-900 w-12 sm:w-20">Qty</th>
                    <th className="text-right p-2 sm:p-3 font-bold text-orange-900 w-16 sm:w-24">Rate</th>
                    <th className="text-right p-2 sm:p-3 font-bold text-orange-900 w-16 sm:w-20">Amount</th>
                    <th className="text-right p-2 sm:p-3 font-bold text-orange-900 hidden sm:table-cell">Tax</th>
                    <th className="text-right p-2 sm:p-3 font-bold text-orange-900 w-16 sm:w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsWithTotals.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-2 sm:p-3 text-gray-800">{item.description}</td>
                      <td className="text-center p-2 sm:p-3 text-gray-800">{item.quantity}</td>
                      <td className="text-right p-2 sm:p-3 text-gray-800">
                        {formatCurrency(item.rate)}
                      </td>
                      <td className="text-right p-2 sm:p-3 text-gray-800">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="text-right p-2 sm:p-3 text-gray-800 hidden sm:table-cell">
                        {formatCurrency(item.tax)}
                      </td>
                      <td className="text-right p-2 sm:p-3 font-semibold text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-6 sm:mb-8">
              <div className="w-64 sm:w-80">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 border-b border-gray-200 text-xs sm:text-sm">
                  <span className="font-semibold text-gray-700">Subtotal</span>
                  <span className="text-gray-900">{formatCurrency(grandSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 border-b border-gray-200 text-xs sm:text-sm">
                  <span className="font-semibold text-gray-700">Tax</span>
                  <span className="text-gray-900">{formatCurrency(grandTax)}</span>
                </div>
                <div className="flex justify-between items-center p-2 sm:p-3 bg-orange-100 border-2 border-orange-400">
                  <span className="font-bold text-orange-900 text-sm sm:text-lg">Total Amount</span>
                  <span className="font-bold text-orange-900 text-sm sm:text-lg">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(data.notes || data.terms) && (
              <div className="space-y-3 sm:space-y-4 border-t-2 border-gray-200 pt-4 sm:pt-6">
                {data.notes && (
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
                      Notes
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{data.notes}</p>
                  </div>
                )}
                {data.terms && (
                  <div>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
                      Terms & Conditions
                    </p>
                    <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">{data.terms}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center text-xs text-gray-600">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
