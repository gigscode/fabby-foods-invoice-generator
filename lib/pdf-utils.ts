// Client-side PDF generation utility using html2pdf
export async function generatePDF(elementId: string, fileName: string) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Invoice element not found');
    }

    // Access html2pdf from window if available, or load it dynamically
    const html2pdfLib = (window as any).html2pdf;
    if (!html2pdfLib) {
      throw new Error('html2pdf library not loaded');
    }

    const options = {
      margin: [10, 10, 10, 10],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        logging: false,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: { 
        orientation: 'portrait', 
        unit: 'mm', 
        format: 'a4',
        compress: true,
      },
    };

    // Create a clone of the element to avoid modifying the DOM
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Hide print-only elements in the clone
    const printHiddenElements = clonedElement.querySelectorAll('.print\\:hidden');
    printHiddenElements.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    await html2pdfLib().set(options).from(clonedElement).save();
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function calculateLineItemTotal(quantity: number, rate: number): number {
  return quantity * rate;
}

export function calculateTaxAmount(subtotal: number, taxPercentage: number): number {
  return (subtotal * taxPercentage) / 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}
