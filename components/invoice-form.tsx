'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus } from 'lucide-react';
import type { InvoiceFormData } from '@/lib/types';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  fromCompany: z.string().min(1, 'Company name is required'),
  fromAddress: z.string().min(1, 'Address is required'),
  fromCity: z.string().min(1, 'City is required'),
  fromPhone: z.string().min(1, 'Phone number is required'),
  toName: z.string().min(1, 'Customer name is required'),
  toAddress: z.string().min(1, 'Customer address is required'),
  toCity: z.string().min(1, 'Customer city is required'),
  toEmail: z.string().email('Valid email is required'),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      rate: z.number().min(0, 'Rate must be positive'),
      tax: z.number().min(0).max(100, 'Tax must be between 0-100'),
    })
  ).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormType = z.infer<typeof invoiceSchema>;

export interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
}

export function InvoiceForm({ onSubmit }: InvoiceFormProps) {
  const { control, register, handleSubmit, formState: { errors }, watch } = useForm<InvoiceFormType>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: 'INV-001',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fromCompany: 'Fabby Foods',
      fromAddress: '',
      fromCity: 'Nigeria',
      fromPhone: '+234-8057385962',
      toName: '',
      toAddress: '',
      toCity: '',
      toEmail: '',
      items: [
        { id: '1', description: '', quantity: 1, rate: 0, tax: 18 }
      ],
      notes: '',
      terms: 'Payment due within 30 days',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleFormSubmit = (data: InvoiceFormType) => {
    onSubmit(data as InvoiceFormData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Invoice Generator</CardTitle>
        <CardDescription>Fill in the details to generate your invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Invoice Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Invoice Number
                </label>
                <Input
                  {...register('invoiceNumber')}
                  placeholder="INV-001"
                  className={`text-sm ${errors.invoiceNumber ? 'border-red-500' : ''}`}
                />
                {errors.invoiceNumber && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.invoiceNumber.message}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <Input
                  type="date"
                  {...register('invoiceDate')}
                  className={errors.invoiceDate ? 'border-red-500' : ''}
                />
                {errors.invoiceDate && (
                  <span className="text-sm text-red-500">{errors.invoiceDate.message}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  {...register('dueDate')}
                  className={errors.dueDate ? 'border-red-500' : ''}
                />
                {errors.dueDate && (
                  <span className="text-sm text-red-500">{errors.dueDate.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* From (Company) */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">From (Your Company)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Company Name
                </label>
                <Input
                  {...register('fromCompany')}
                  placeholder="Fabby Foods"
                  disabled
                  className={`text-sm bg-gray-100 cursor-not-allowed ${errors.fromCompany ? 'border-red-500' : ''}`}
                />
                {errors.fromCompany && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.fromCompany.message}</span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Phone
                </label>
                <Input
                  {...register('fromPhone')}
                  placeholder="+234-8057385962"
                  className={`text-sm ${errors.fromPhone ? 'border-red-500' : ''}`}
                />
                {errors.fromPhone && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.fromPhone.message}</span>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Address
                </label>
                <Input
                  {...register('fromAddress')}
                  placeholder="Street address"
                  className={`text-sm ${errors.fromAddress ? 'border-red-500' : ''}`}
                />
                {errors.fromAddress && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.fromAddress.message}</span>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  City
                </label>
                <Input
                  {...register('fromCity')}
                  placeholder="City, State, Country"
                  className={`text-sm ${errors.fromCity ? 'border-red-500' : ''}`}
                />
                {errors.fromCity && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.fromCity.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* To (Customer) */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">To (Customer)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Customer Name
                </label>
                <Input
                  {...register('toName')}
                  placeholder="Customer name"
                  className={`text-sm ${errors.toName ? 'border-red-500' : ''}`}
                />
                {errors.toName && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.toName.message}</span>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  {...register('toEmail')}
                  placeholder="customer@example.com"
                  className={`text-sm ${errors.toEmail ? 'border-red-500' : ''}`}
                />
                {errors.toEmail && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.toEmail.message}</span>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Address
                </label>
                <Input
                  {...register('toAddress')}
                  placeholder="Street address"
                  className={`text-sm ${errors.toAddress ? 'border-red-500' : ''}`}
                />
                {errors.toAddress && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.toAddress.message}</span>
                )}
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  City
                </label>
                <Input
                  {...register('toCity')}
                  placeholder="City, State, Country"
                  className={`text-sm ${errors.toCity ? 'border-red-500' : ''}`}
                />
                {errors.toCity && (
                  <span className="text-xs sm:text-sm text-red-500 mt-1 block">{errors.toCity.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Line Items</h3>
            <div className="space-y-3 overflow-x-auto">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-2 items-start md:items-end bg-gray-50 p-3 sm:p-4 rounded-lg"
                >
                  <div className="col-span-1 md:col-span-5">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      Description
                    </label>
                    <Controller
                      name={`items.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Item description"
                          className="text-xs sm:text-sm"
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      Qty
                    </label>
                    <Controller
                      name={`items.${index}.quantity`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="1"
                          min="0"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-xs sm:text-sm"
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      Rate
                    </label>
                    <Controller
                      name={`items.${index}.rate`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-xs sm:text-sm"
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">
                      Tax %
                    </label>
                    <Controller
                      name={`items.${index}.tax`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="text-xs sm:text-sm"
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-1 flex justify-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 sm:h-9"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.items && (
              <span className="text-xs sm:text-sm text-red-500">{errors.items.message}</span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  id: Date.now().toString(),
                  description: '',
                  quantity: 1,
                  rate: 0,
                  tax: 18,
                })
              }
              className="w-full text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Notes & Terms */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Additional Information</h3>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Notes
              </label>
              <Textarea
                {...register('notes')}
                placeholder="Any additional notes..."
                rows={3}
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Terms & Conditions
              </label>
              <Textarea
                {...register('terms')}
                placeholder="Terms and conditions..."
                rows={3}
                className="text-sm"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 sm:py-3 text-sm sm:text-base font-medium">
            Generate Invoice
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
