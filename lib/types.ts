export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface InvoiceFormData {
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTime: string;
  
  // To (Customer)
  toName: string;
  toAddress: string;
  toCity: string;
  
  // Items
  items: LineItem[];
  
  // Additional
  notes?: string;
}
