import { jsPDF } from 'jspdf';
import type { InvoiceFormData } from './types';

type RGBColor = [number, number, number];

type JsPDFInstance = InstanceType<typeof jsPDF>;

const PDF_FONT_FAMILY = 'Poppins';
const PDF_FONT_FALLBACK = 'helvetica';

type PdfFontStyle = 'normal' | 'bold';

function setRgbColor(doc: JsPDFInstance, method: 'setTextColor' | 'setFillColor' | 'setDrawColor', color: RGBColor) {
  doc[method](color[0], color[1], color[2]);
}

function registerPdfFonts(doc: JsPDFInstance) {
  const availableFonts = doc.getFontList();

  if (availableFonts[PDF_FONT_FAMILY]) {
    return PDF_FONT_FAMILY;
  }

  try {
    doc.addFont('/fonts/Poppins-Regular.ttf', PDF_FONT_FAMILY, 'normal', 400);
    doc.addFont('/fonts/Poppins-Bold.ttf', PDF_FONT_FAMILY, 'bold', 700);
    return PDF_FONT_FAMILY;
  } catch (error) {
    console.warn('Poppins font could not be loaded for PDF generation. Falling back to Helvetica.', error);
    return PDF_FONT_FALLBACK;
  }
}

function setPdfFont(doc: JsPDFInstance, fontFamily: string, fontStyle: PdfFontStyle) {
  doc.setFont(fontFamily, fontStyle);
}

function formatInvoiceDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatInvoiceTime(value: string) {
  const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);

  if (match) {
    const hour = Number(match[1]);
    const minute = match[2];
    const meridiem = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12;
    return `${twelveHour}:${minute} ${meridiem}`;
  }

  const parsed = new Date(`1970-01-01T${value}`);

  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function normalizeText(value: string | undefined) {
  return (value ?? '').replace(/\r\n/g, '\n').trim();
}

function wrapLines(doc: JsPDFInstance, value: string | undefined, maxWidth: number) {
  const text = normalizeText(value);
  if (!text) return ['-'];
  return text.split('\n').flatMap((line) => doc.splitTextToSize(line.trim() || ' ', maxWidth));
}

function drawFittedText(
  doc: JsPDFInstance,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    align?: 'left' | 'center' | 'right';
    minFontSize?: number;
    maxFontSize?: number;
  } = {}
) {
  const originalFontSize = doc.getFontSize();
  const minFontSize = options.minFontSize ?? 7;
  let fontSize = options.maxFontSize ?? originalFontSize;

  doc.setFontSize(fontSize);

  while (fontSize > minFontSize && doc.getTextWidth(text) > maxWidth) {
    fontSize = Math.max(minFontSize, fontSize - 0.2);
    doc.setFontSize(fontSize);
  }

  doc.text(text, x, y, { align: options.align ?? 'left' });
  doc.setFontSize(originalFontSize);
}

function drawInfoBox(
  doc: JsPDFInstance,
  fontFamily: string,
  x: number,
  y: number,
  width: number,
  title: string,
  titleColor: RGBColor,
  backgroundColor: RGBColor,
  accentColor: RGBColor,
  lines: Array<{ text: string; color: RGBColor; style?: 'normal' | 'bold' }>
) {
  const lineHeight = 5;
  const height = 13 + lines.length * lineHeight + 4;
  setRgbColor(doc, 'setFillColor', backgroundColor);
  doc.rect(x, y, width, height, 'F');
  setRgbColor(doc, 'setFillColor', accentColor);
  doc.rect(x, y, 1.6, height, 'F');
  setPdfFont(doc, fontFamily, 'bold');
  doc.setFontSize(8);
  setRgbColor(doc, 'setTextColor', titleColor);
  doc.text(title.toUpperCase(), x + 4, y + 6);

  let currentY = y + 12;
  lines.forEach((line) => {
    setPdfFont(doc, fontFamily, line.style === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(10.5);
    setRgbColor(doc, 'setTextColor', line.color);
    doc.text(line.text, x + 4, currentY);
    currentY += lineHeight;
  });

  return height;
}

export async function generatePDF(data: InvoiceFormData, fileName: string) {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const fontFamily = registerPdfFonts(doc);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const bottomLimit = () => pageHeight - margin;

    const ORANGE: RGBColor = [234, 88, 12];
    const ORANGE_DARK: RGBColor = [194, 65, 12];
    const ORANGE_LIGHT: RGBColor = [255, 247, 237];
    const YELLOW_LIGHT: RGBColor = [254, 252, 232];
    const YELLOW_DARK: RGBColor = [133, 77, 14];
    const GRAY_LIGHT: RGBColor = [249, 250, 251];
    const GRAY_BORDER: RGBColor = [229, 231, 235];
    const GRAY_TEXT: RGBColor = [75, 85, 99];
    const GRAY_TITLE: RGBColor = [55, 65, 81];
    const DARK_TEXT: RGBColor = [17, 24, 39];
    const BODY_TEXT: RGBColor = [31, 41, 55];
    const WHITE: RGBColor = [255, 255, 255];
    const BILL_TO_ACCENT: RGBColor = [156, 163, 175];
    const NOTE_ACCENT: RGBColor = [250, 204, 21];

    let y = margin;
    const addPage = () => {
      doc.addPage();
      y = margin;
    };
    const ensureSpace = (height: number, redrawTableHeader?: () => void) => {
      if (y + height <= bottomLimit()) return;
      addPage();
      redrawTableHeader?.();
    };

    setPdfFont(doc, fontFamily, 'bold');
    doc.setFontSize(18);
    setRgbColor(doc, 'setTextColor', DARK_TEXT);
    doc.text('Fabby G International Limited', margin, y + 2);
    doc.setFontSize(11);
    setRgbColor(doc, 'setTextColor', ORANGE);
    doc.text('FabbyGinternational', margin, y + 8);
    doc.setFontSize(24);
    doc.text('INVOICE', pageWidth - margin, y + 2, { align: 'right' });
    setPdfFont(doc, fontFamily, 'normal');
    doc.setFontSize(10);
    setRgbColor(doc, 'setTextColor', GRAY_TEXT);
    doc.text(data.invoiceNumber, pageWidth - margin, y + 8, { align: 'right' });
    doc.setLineWidth(1);
    setRgbColor(doc, 'setDrawColor', ORANGE);
    doc.line(margin, y + 12, pageWidth - margin, y + 12);
    y += 20;

    const columnGap = 8;
    const columnWidth = (contentWidth - columnGap) / 2;
    const leftLines = [
      { text: 'Fabby G International Limited', color: DARK_TEXT, style: 'bold' as const },
      { text: 'Ayoola Odejayi', color: ORANGE_DARK, style: 'bold' as const },
      { text: 'Acct No. 3021173586 (FirstBank)', color: BODY_TEXT },
      { text: 'Olora Layout along Housing Road Adebayo', color: BODY_TEXT },
      { text: 'Ado Ekiti, Ekiti', color: BODY_TEXT },
      { text: '08060808831', color: DARK_TEXT, style: 'bold' as const },
      { text: 'Nigeria', color: BODY_TEXT },
    ];
    const rightLines = [
      ...wrapLines(doc, data.toName, columnWidth - 8).map((text, index) => ({
        text,
        color: index === 0 ? DARK_TEXT : BODY_TEXT,
        style: index === 0 ? 'bold' as const : 'normal' as const,
      })),
      ...wrapLines(doc, data.toAddress, columnWidth - 8).map((text) => ({ text, color: BODY_TEXT })),
      ...wrapLines(doc, data.toCity, columnWidth - 8).map((text) => ({ text, color: BODY_TEXT })),
    ];
    const leftHeight = 13 + leftLines.length * 5 + 4;
    const rightHeight = 13 + rightLines.length * 5 + 4;
    const boxHeight = Math.max(leftHeight, rightHeight);
    drawInfoBox(doc, fontFamily, margin, y, columnWidth, 'From', ORANGE_DARK, ORANGE_LIGHT, ORANGE, leftLines);
    drawInfoBox(doc, fontFamily, margin + columnWidth + columnGap, y, columnWidth, 'Bill To', GRAY_TITLE, GRAY_LIGHT, BILL_TO_ACCENT, rightLines);
    y += boxHeight + 10;

    ensureSpace(14);
    setRgbColor(doc, 'setFillColor', ORANGE_LIGHT);
    doc.rect(margin, y, contentWidth, 12, 'F');
    setPdfFont(doc, fontFamily, 'bold');
    doc.setFontSize(8);
    setRgbColor(doc, 'setTextColor', ORANGE_DARK);
    doc.text('INVOICE DATE:', margin + 4, y + 5);
    doc.text('TIME:', margin + 96, y + 5);
    doc.setFontSize(10);
    setRgbColor(doc, 'setTextColor', DARK_TEXT);
    doc.text(formatInvoiceDate(data.invoiceDate), margin + 4, y + 9);
    doc.text(formatInvoiceTime(data.invoiceTime), margin + 96, y + 9);
    y += 18;

    const tableColumns = { index: 12, description: 84, quantity: 18, rate: 30, amount: 38 };
    const tableX = {
      index: margin,
      description: margin + tableColumns.index,
      quantity: margin + tableColumns.index + tableColumns.description,
      rate: margin + tableColumns.index + tableColumns.description + tableColumns.quantity,
      amount: margin + tableColumns.index + tableColumns.description + tableColumns.quantity + tableColumns.rate,
    };

    const drawTableHeader = () => {
      setRgbColor(doc, 'setFillColor', ORANGE);
      doc.rect(margin, y, contentWidth, 9, 'F');
      setPdfFont(doc, fontFamily, 'bold');
      doc.setFontSize(9.5);
      setRgbColor(doc, 'setTextColor', WHITE);
      doc.text('#', tableX.index + 3, y + 6);
      doc.text('Item Description', tableX.description + 2, y + 6);
      doc.text('Qty', tableX.quantity + tableColumns.quantity / 2, y + 6, { align: 'center' });
      doc.text('Rate', tableX.rate + tableColumns.rate - 2, y + 6, { align: 'right' });
      doc.text('Amount', tableX.amount + tableColumns.amount - 2, y + 6, { align: 'right' });
      y += 9;
    };

    drawTableHeader();
    const itemsWithTotals = data.items.map((item) => ({ ...item, total: calculateLineItemTotal(item.quantity, item.rate) }));
    itemsWithTotals.forEach((item, index) => {
      const descriptionLines = wrapLines(doc, item.description, tableColumns.description - 4);
      const rowHeight = Math.max(10, descriptionLines.length * 4.5 + 4);
      ensureSpace(rowHeight, drawTableHeader);

      if (index % 2 === 1) {
        setRgbColor(doc, 'setFillColor', GRAY_LIGHT);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }

      setRgbColor(doc, 'setDrawColor', GRAY_BORDER);
      doc.rect(margin, y, contentWidth, rowHeight);
      setPdfFont(doc, fontFamily, 'normal');
      doc.setFontSize(9.5);
      setRgbColor(doc, 'setTextColor', GRAY_TEXT);
      doc.text(String(index + 1), tableX.index + 3, y + 6);
      setRgbColor(doc, 'setTextColor', BODY_TEXT);
      doc.text(descriptionLines, tableX.description + 2, y + 6);

      const numericY = y + rowHeight / 2 + 1.5;
      doc.text(String(item.quantity), tableX.quantity + tableColumns.quantity / 2, numericY, { align: 'center' });
      drawFittedText(doc, formatCurrency(item.rate), tableX.rate + tableColumns.rate - 2, numericY, tableColumns.rate - 4, {
        align: 'right',
        minFontSize: 7.2,
        maxFontSize: 9.5,
      });
      setPdfFont(doc, fontFamily, 'bold');
      setRgbColor(doc, 'setTextColor', DARK_TEXT);
      drawFittedText(doc, formatCurrency(item.total), tableX.amount + tableColumns.amount - 2, numericY, tableColumns.amount - 4, {
        align: 'right',
        minFontSize: 7.2,
        maxFontSize: 9.5,
      });
      y += rowHeight;
    });

    const grandTotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
    ensureSpace(22);
    const totalWidth = 82;
    const totalX = pageWidth - margin - totalWidth;
    setRgbColor(doc, 'setFillColor', ORANGE);
    doc.rect(totalX, y, totalWidth, 14, 'F');
    setPdfFont(doc, fontFamily, 'bold');
    doc.setFontSize(11);
    setRgbColor(doc, 'setTextColor', WHITE);
    doc.text('TOTAL', totalX + 4, y + 8.5);
    drawFittedText(doc, formatCurrency(grandTotal), totalX + totalWidth - 4, y + 8.5, totalWidth - 28, {
      align: 'right',
      minFontSize: 7.4,
      maxFontSize: 11,
    });
    y += 22;

    const notes = normalizeText(data.notes);
    if (notes) {
      const noteLines = wrapLines(doc, notes, contentWidth - 8);
      const noteHeight = 12 + noteLines.length * 4.8 + 4;
      ensureSpace(noteHeight + 6);
      setRgbColor(doc, 'setFillColor', YELLOW_LIGHT);
      doc.rect(margin, y, contentWidth, noteHeight, 'F');
      setRgbColor(doc, 'setFillColor', NOTE_ACCENT);
      doc.rect(margin, y, 1.6, noteHeight, 'F');
      setPdfFont(doc, fontFamily, 'bold');
      doc.setFontSize(8);
      setRgbColor(doc, 'setTextColor', YELLOW_DARK);
      doc.text('NOTES', margin + 4, y + 5.5);
      setPdfFont(doc, fontFamily, 'normal');
      doc.setFontSize(9.5);
      setRgbColor(doc, 'setTextColor', GRAY_TITLE);
      doc.text(noteLines, margin + 4, y + 11);
      y += noteHeight + 8;
    }

    ensureSpace(20);
    setRgbColor(doc, 'setDrawColor', GRAY_BORDER);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
    setPdfFont(doc, fontFamily, 'bold');
    doc.setFontSize(10);
    setRgbColor(doc, 'setTextColor', ORANGE);
    doc.text('It was great doing business with you.', pageWidth / 2, y, { align: 'center' });
    setPdfFont(doc, fontFamily, 'normal');
    doc.setFontSize(8.5);
    setRgbColor(doc, 'setTextColor', GRAY_TEXT);
    doc.text('Terms & Conditions: Please make the payment by the due date.', pageWidth / 2, y + 6, { align: 'center' });
    doc.save(fileName);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function calculateLineItemTotal(quantity: number, rate: number): number {
  return quantity * rate;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
}
