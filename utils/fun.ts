import fs from 'node:fs'
import path from 'path'
import { PDFDocument } from 'pdf-lib';
export function generatePseudoUUID() {
	const chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
	return chars.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export async function replacePage(mainPdf: string, newpdf: string) {
	console.log({ mainPdf, newpdf });

	// Define the relative paths to your PDF files
	const originalPdfPath = path.resolve(__dirname, '../../pdf/quotationmain.pdf');
	const newPdfPath = path.resolve(__dirname, '../../pdf/quotation.pdf');
	const modifiedPdfPath = path.resolve(__dirname, '../../pdf/modified_quotationmain.pdf');

	console.log('Original PDF path:', originalPdfPath);
	console.log('New PDF path:', newPdfPath);
	console.log('Modified PDF path:', modifiedPdfPath);

	// Check if the files exist
	if (!fs.existsSync(originalPdfPath)) {
		console.error('Original PDF file does not exist.');
		return;
	}
	if (!fs.existsSync(newPdfPath)) {
		console.error('New PDF file does not exist.');
		return;
	}

	return
	// Load the original PDF
	const originalPdfBytes: any = await fs.readFile(mainPdf, (err, data) => {
		if (err) throw err;
		console.log(data);
		return data
	});

	console.log({ originalPdfBytes });


	const originalPdfDoc = await PDFDocument.load(originalPdfBytes);

	// Load the new PDF
	const newPdfBytes: any = fs.readFile(newpdf, (err, data) => {
		if (err) throw err;
		console.log(data);
		return data
	});
	const newPdfDoc = await PDFDocument.load(newPdfBytes);

	// Extract the page from the new PDF
	const [newPage] = await originalPdfDoc.copyPages(newPdfDoc, [0]); // Assuming you want the first page of the new PDF

	// Insert the new page into the original PDF
	const pageIndexToReplace = 2; // 0-based index, so 2 is the 3rd page
	originalPdfDoc.insertPage(pageIndexToReplace, newPage);

	// Remove the original 3rd page
	originalPdfDoc.removePage(pageIndexToReplace + 1); // +1 because we've inserted a new page at the 3rd position

	// Serialize the modified PDFDocument to bytes (a Uint8Array)
	const pdfBytes = await originalPdfDoc.save();

	// Write the modified PDF to a file
	fs.writeFile('/pdf/modified.pdf', pdfBytes, (err) => {
		if (err) throw err;
		console.log('The file has been saved!');
	});
}