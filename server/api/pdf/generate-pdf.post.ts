import fs from 'node:fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { createPricingPDF, type PricingPDFParams } from '~/utils/fun';
import { generateQoutaion } from './pdf.dto';

// Function to replace a page in the PDF
export async function replacePage(data: PricingPDFParams) {
  try {
    // Load the original PDF
    const filePath = path.resolve('./pdf/quotationmain.pdf');
    const originalPdfBytes = fs.readFileSync(filePath);
    const originalPdfDoc = await PDFDocument.load(originalPdfBytes);

    // Create the new PDF
    const newPdfBytes = await createPricingPDF(data);
    const newPdfDoc = await PDFDocument.load(newPdfBytes);

    // Extract the first page from the new PDF
    const [newPage] = await originalPdfDoc.copyPages(newPdfDoc, [0]);

    // Insert the new page into the original PDF
    const pageIndexToReplace = 6; // 0-based index, so 6 is the 7th page
    originalPdfDoc.insertPage(pageIndexToReplace, newPage);

    // Remove the original page at the index after the inserted one
    originalPdfDoc.removePage(pageIndexToReplace + 1);

    // Serialize the modified PDFDocument to bytes
    const pdfBytes = await originalPdfDoc.save();

    return pdfBytes;
  } catch (error) {
    console.error('Error in replacePage function:', error);
    throw new Error(`Failed to replace page in PDF ${error}`);
  }
}

// Define the event handler
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    console.log({ body });

    const data: any = generateQoutaion.parse(body);
    console.log({ data });

    const filename = 'quotation.pdf';

    // Set the headers to trigger a file download
    setResponseHeaders(event, {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/pdf',
    });

    // Replace the page and get the modified PDF bytes
    const pdfBytes = await replacePage(data);

    // Send the PDF bytes as the response
    return send(event, pdfBytes);
  } catch (error: any) {
    // const statusMessage = typeof error.message === 'string' ? error.message : 'Internal Server Error';
    // throw createError({ statusCode: 500, statusMessage });
    return error
  }
});
