export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  tax: number; // tax percentage
}

export interface InvoiceFormData {
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  
  // From (Company)
  fromCompany: string;
  fromAddress: string;
  fromCity: string;
  fromPhone: string;
  
  // To (Customer)
  toName: string;
  toAddress: string;
  toCity: string;
  toEmail: string;
  
  // Items
  items: LineItem[];
  
  // Additional
  notes: string;
  terms: string;
}
