// file: ~/server/api/pdf/my-pdf.vue
import fs from 'node:fs';

import { PDFDocument } from 'pdf-lib';
import { createPricingPDF, type PricingPDFParams } from '~/utils/fun';
import { generateQoutaion } from './pdf.dto';



// Convert the URL of the current module to a file path




export async function replacePage(data: PricingPDFParams) {

  // Load the original PDF
  const originalPdfBytes = fs.readFileSync('./pdf/quotationmain.pdf');


  const originalPdfDoc = await PDFDocument.load(originalPdfBytes);

  // Load the new PDF

  const newPdfBytes = await createPricingPDF(data);
  const newPdfDoc = await PDFDocument.load(newPdfBytes);

  // Extract the page from the new PDF
  const [newPage] = await originalPdfDoc.copyPages(newPdfDoc, [0]); // Assuming you want the first page of the new PDF

  // Insert the new page into the original PDF
  const pageIndexToReplace = 6; // 0-based index, so 2 is the 3rd page
  originalPdfDoc.insertPage(pageIndexToReplace, newPage);

  // Remove the original 3rd page
  originalPdfDoc.removePage(pageIndexToReplace + 1); // +1 because we've inserted a new page at the 3rd position

  // Serialize the modified PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await originalPdfDoc.save();

  // Write the modified PDF to a file
  // fs.writeFile('./pdf/modified.pdf', pdfBytes, (err) => {
  //   if (err) throw err;
  //   console.log('The file has been saved!');
  // });

  return pdfBytes
}


export default defineEventHandler(async (event) => {

  try {

    const body = await readBody(event)
    console.log({ body });

    const data: any = generateQoutaion.parse(body)

    console.log({ data });



    const filename = 'quotation.pdf';

    // Set the headers to trigger a file download
    setResponseHeaders(event, {
      'Content-Disposition': `attachment; filename = "${filename}"`,
      'Content-Type': 'application/pdf' // S
    })


    const pdfbyts = await replacePage(data)

    // return sendStream(event, fs.createReadStream('./pdf/modified.pdf'))
    return send(event, pdfbyts)
  } catch (error: any) {
    throw createError({ statusCode: 400, statusMessage: error })
  }
})
