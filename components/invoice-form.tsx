'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, FileText } from 'lucide-react';
import type { InvoiceFormData } from '@/lib/types';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  invoiceTime: z.string().min(1, 'Invoice time is required'),
  toName: z.string().min(1, 'Customer name is required'),
  toAddress: z.string().min(1, 'Customer address is required'),
  toCity: z.string().min(1, 'Customer city is required'),
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string().min(1, 'Description is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      rate: z.number().min(0, 'Rate must be positive'),
    })
  ).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

type InvoiceFormType = z.infer<typeof invoiceSchema>;

export interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
}

export function InvoiceForm({ onSubmit }: InvoiceFormProps) {
  const now = new Date();
  const { control, register, handleSubmit, formState: { errors } } = useForm<InvoiceFormType>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-01`,
      invoiceDate: now.toISOString().split('T')[0],
      invoiceTime: now.toTimeString().slice(0, 5),
      toName: '',
      toAddress: '',
      toCity: '',
      items: [
        { id: '1', description: '', quantity: 1, rate: 0 }
      ],
      notes: '',
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
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white/95 backdrop-blur">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Create Invoice</CardTitle>
              <p className="text-orange-50 text-sm mt-1">Fabby G International Limited</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded"></span>
                Invoice Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Invoice Number
                  </label>
                  <Input
                    {...register('invoiceNumber')}
                    placeholder="INV-001"
                    className={`${errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.invoiceNumber && (
                    <span className="text-xs text-red-500 mt-1 block">{errors.invoiceNumber.message}</span>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <Input
                    type="date"
                    {...register('invoiceDate')}
                    className={errors.invoiceDate ? 'border-red-500' : 'border-gray-300'}
                  />
                  {errors.invoiceDate && (
                    <span className="text-xs text-red-500 mt-1 block">{errors.invoiceDate.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Time
                  </label>
                  <Input
                    type="time"
                    {...register('invoiceTime')}
                    className={errors.invoiceTime ? 'border-red-500' : 'border-gray-300'}
                  />
                  {errors.invoiceTime && (
                    <span className="text-xs text-red-500 mt-1 block">{errors.invoiceTime.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded"></span>
                Customer Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Customer Name
                  </label>
                  <Input
                    {...register('toName')}
                    placeholder="Enter customer name"
                    className={errors.toName ? 'border-red-500' : 'border-gray-300'}
                  />
                  {errors.toName && (
                    <span className="text-xs text-red-500 mt-1 block">{errors.toName.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address
                  </label>
                  <Input
                    {...register('toAddress')}
                    placeholder="Street address"
                    className={errors.toAddress ? 'border-red-500' : 'border-gray-300'}
                  />
                  {errors.toAddress && (
                    <span className="text-xs text-red-500 mt-1 block">{errors.toAddress.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City
                  </label>
                  <Input
                    {...register('toCity')}
                    placeholder="City, State"
                    className={errors.toCity ? 'border-red-500' : 'border-gray-300'}
                  />
                  {errors.toCity && (
                    <span className="text-xs text-red-500 mt-1 block">{errors.toCity.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded"></span>
                Items
              </h3>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 space-y-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">Item {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Description
                      </label>
                      <Controller
                        name={`items.${index}.description`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Item description"
                            className="text-sm"
                          />
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantity
                        </label>
                        <Controller
                          name={`items.${index}.quantity`}
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              step="1"
                              min="1"
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="text-sm"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price (₦)
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
                              className="text-sm"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.items && (
                <span className="text-xs text-red-500">{errors.items.message}</span>
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
                  })
                }
                className="w-full border-dashed border-2 border-gray-300 hover:border-orange-400 hover:bg-orange-50 text-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded"></span>
                Additional Notes
              </h3>
              <Textarea
                {...register('notes')}
                placeholder="Any additional notes (optional)..."
                rows={3}
                className="text-sm border-gray-300"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-base font-semibold shadow-lg"
            >
              Generate Invoice
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
