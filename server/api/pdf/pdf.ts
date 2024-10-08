import fs from 'node:fs'
import { PDFDocument, PageSizes, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'
import { DataArray, convertToObjects, createPricingPDF } from '~/utils/fun';
import { google } from 'googleapis';



export default defineEventHandler(async (event) => {
	const file = fs.readFileSync("./pdf/quotationmain.pdf")

	const srcDoc = await PDFDocument.load(file);
	const pdfDoc = await PDFDocument.create()
	const [page] = await pdfDoc.copyPages(srcDoc, [6])

	pdfDoc.insertPage(0, page);
	const firstPage = pdfDoc.getPage(0)
	const form = pdfDoc.getForm()

	// firstPage.
	const svd = await pdfDoc.save()
	// setResponseHeaders(event, {
	// 	'Content-Disposition': `attachment; filename="quotation.pdf"`,
	// 	'Content-Type': 'application/pdf' // S
	// })


	// const ppdf = await createPricingPDF({
	// 	date: "12/12/24",
	// 	customerId: "CUST-LWBP8X86-TSSKVTK9",
	// 	validTill: "12/12/24",
	// 	customer: 'Ali',
	// 	projectDescription: 'Digital Marketing',
	// 	tableData: [
	// 		['Full Audit (SEO/ads/etc)', '1', '2,000', '2,000'],
	// 		['SEO & Optimisation', '1', '10,000', '10,000'],
	// 		['Content Marketing Strategy', '1', '5,000', '5,000'],
	// 		['Ads Strategy', '3', '2,000', '6,000'],
	// 		// ['Poster', '12', '450', '5,400'],
	// 		// ['Reel', '2', '1,000', '2,000'],
	// 		['LinkedIn Campaign for followers & Lead Generation', '1', '7,000', '7,000'],
	// 		// ['Page SET UP & Management', '', '5,000', '5,000'],
	// 	],
	// 	subtotal: 42400,
	// 	gst: 56555,
	// 	total: '42,400',
	// });

	console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);

	const auth = new google.auth.GoogleAuth({
		keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
		scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
	});

	const sheets = google.sheets({
		version: "v4",
		auth: auth
	});

	const sheetId = process.env.SHEET_ID; // Replace with your actual sheet ID
	const range = 'Sheet1!A1:B5';
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: sheetId,
		range
	})
	const dt = convertToObjects(res.data.values as DataArray)




	return {
		dt
	}
	// return send(event, ppdf)
})



// async function createPricingPDF({
// 	customer,
// 	projectDescription,
// 	tableData,
// 	subtotal,
// 	total
// }: any) {
// 	// Create a new PDF document
// 	const pdfDoc = await PDFDocument.create();

// 	pdfDoc.registerFontkit(fontkit);

// 	const nexBoldBytes = fs.readFileSync("./assets/fonts/Nexa-bold.otf");
// 	const nexLightBytes = fs.readFileSync("./assets/fonts/Nexa-light.otf");
// 	const telegrafRegBytes = fs.readFileSync("./assets/fonts/Telegraf-Regular.otf");
// 	const telegrafUltraBoldBytes = fs.readFileSync("./assets/fonts/Telegraf-Ultrabold.otf");

// 	const nexaBoldFont = await pdfDoc.embedFont(nexBoldBytes);
// 	const nexaLightFont = await pdfDoc.embedFont(nexLightBytes);
// 	const telegrafRegFont = await pdfDoc.embedFont(telegrafRegBytes);
// 	const telegrafUltraBoldFont = await pdfDoc.embedFont(telegrafUltraBoldBytes);

// 	// Add a page
// 	const page = pdfDoc.addPage(PageSizes.A4);
// 	const { width, height } = page.getSize();

// 	// Define colors
// 	const darkBlue = rgb(0.12, 0.16, 0.36);
// 	const maroon = rgb(0.5, 0, 0);

// 	// Add the website header
// 	page.drawText('www.ashcorptechnologies.com', {
// 		x: 50,
// 		y: height - 70,
// 		size: 12,
// 		font: nexaLightFont,
// 		color: darkBlue,
// 	});

// 	// Add the main title
// 	page.drawText('Pricing', {
// 		x: 50,
// 		y: height - 140,
// 		size: 42,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});


// 	page.drawText('DATE :', {
// 		x: 430,
// 		y: height - 120,
// 		size: 11,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});

// 	page.drawText('21/10/24', {
// 		x: 475,
// 		y: height - 120,
// 		size: 11,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});

// 	page.drawText('CUSTOMERID :', {
// 		x: 388,
// 		y: height - 140,
// 		size: 11,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});

// 	page.drawText('21/10/24', {
// 		x: 475,
// 		y: height - 140,
// 		size: 11,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});

// 	page.drawText('VALID TILL :', {
// 		x: 402,
// 		y: height - 160,
// 		size: 11,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});

// 	page.drawText('21/10/24', {
// 		x: 475,
// 		y: height - 160,
// 		size: 11,
// 		font: nexaBoldFont,
// 		color: darkBlue,
// 	});

// 	// Draw the customer and project description section
// 	page.drawText('CUSTOMER', {
// 		x: 50,
// 		y: height - 210,
// 		size: 12,
// 		font: telegrafUltraBoldFont,
// 		color: maroon,
// 	});
// 	page.drawText(customer, {
// 		x: 50,
// 		y: height - 230,
// 		size: 12,
// 		font: telegrafRegFont,
// 		color: darkBlue,
// 	});
// 	page.drawText('PROJECT DESCRIPTION:', {
// 		x: 380,
// 		y: height - 210,
// 		size: 12,
// 		font: telegrafUltraBoldFont,
// 		color: maroon,
// 	});
// 	page.drawText(projectDescription, {
// 		x: 380,
// 		y: height - 230,
// 		size: 12,
// 		font: telegrafRegFont,
// 		color: darkBlue,
// 	});

// 	page.drawLine({
// 		start: { x: 50, y: height - 250 },
// 		end: { x: width - 50, y: height - 250 },
// 		thickness: 2,
// 		color: rgb(0.75, 0.2, 0.2),
// 		opacity: 0.75,
// 	});

// 	// Define table headers
// 	const headers = ['DESCRIPTION', 'QUANTITY', 'PRICE', 'TOTAL'];
// 	const headerY = height - 280;
// 	const headerXPositions = [50, 290, 390, 490];
// 	const cellWidths = [240, 100, 100, 100];

// 	headers.forEach((text, i) => {
// 		page.drawText(text, {
// 			x: headerXPositions[i],
// 			y: headerY,
// 			size: 12,
// 			font: telegrafUltraBoldFont,
// 			color: darkBlue,
// 		});
// 	});

// 	// Draw table data
// 	// let tableY = headerY - 30;
// 	// const rowHeight = 40;
// 	// tableData.forEach((row: any) => {
// 	// 	row.forEach((text: string, i: number) => {
// 	// 		page.drawText(text, {
// 	// 			x: headerXPositions[i],
// 	// 			y: tableY,
// 	// 			size: 12,
// 	// 			font: telegrafRegFont,
// 	// 			color: darkBlue,
// 	// 		});
// 	// 	});
// 	// 	tableY -= rowHeight;
// 	// });

// 	// Function to split text into lines based on the available width
// 	function splitTextIntoLines(text: string, maxWidth: any, font: any, fontSize: any) {
// 		const lines = [];
// 		let line = '';
// 		const words = text.split(' ');

// 		words.forEach(word => {
// 			const testLine = line + word + ' ';
// 			const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);

// 			if (testLineWidth > maxWidth && line !== '') {
// 				lines.push(line.trim());
// 				line = word + ' ';
// 			} else {
// 				line = testLine;
// 			}
// 		});

// 		if (line.trim() !== '') {
// 			lines.push(line.trim());
// 		}

// 		return lines;
// 	}

// 	// Draw table data
// 	let tableY = headerY - 30;
// 	const rowHeight = 40;
// 	tableData.forEach((row: any) => {
// 		let maxRowHeight = rowHeight;

// 		// Split text for each cell and calculate row height
// 		const cellLines = row.map((cellText: string, i: number) => {
// 			const lines = splitTextIntoLines(cellText, cellWidths[i], telegrafRegFont, 12);
// 			maxRowHeight = Math.max(maxRowHeight, lines.length * 12);
// 			return lines;
// 		});

// 		// Draw each cell's text
// 		cellLines.forEach((lines: any, i: number) => {
// 			lines.forEach((line: any, j: any) => {
// 				page.drawText(line, {
// 					x: headerXPositions[i],
// 					y: tableY - j * 12,
// 					size: 12,
// 					font: telegrafRegFont,
// 					color: darkBlue,
// 				});
// 			});
// 		});

// 		tableY -= maxRowHeight;
// 	});


// 	page.drawLine({
// 		start: { x: 50, y: tableY - 5 },
// 		end: { x: width - 50, y: tableY - 5 },
// 		thickness: 2,
// 		color: rgb(0.75, 0.2, 0.2),
// 		opacity: 0.75,
// 	});

// 	// Add subtotal and total
// 	page.drawText('SUBTOTAL:', {
// 		x: 370,
// 		y: tableY - 50,
// 		size: 12,
// 		font: telegrafUltraBoldFont,
// 		color: darkBlue,
// 	});
// 	page.drawText(subtotal.toString(), {
// 		x: 470,
// 		y: tableY - 50,
// 		size: 12,
// 		font: telegrafRegFont,
// 		color: darkBlue,
// 	});

// 	// Add gst
// 	page.drawText('GST:', {
// 		x: 370,
// 		y: tableY - 70,
// 		size: 12,
// 		font: telegrafUltraBoldFont,
// 		color: darkBlue,
// 	});
// 	page.drawText(subtotal.toString(), {
// 		x: 470,
// 		y: tableY - 70,
// 		size: 12,
// 		font: telegrafRegFont,
// 		color: darkBlue,
// 	});
// 	page.drawText('TOTAL:', {
// 		x: 370,
// 		y: tableY - 90,
// 		size: 12,
// 		font: telegrafUltraBoldFont,
// 		color: darkBlue,
// 	});
// 	page.drawText(total.toString(), {
// 		x: 470,
// 		y: tableY - 90,
// 		size: 12,
// 		font: telegrafUltraBoldFont,
// 		color: darkBlue,
// 	});

// 	// Save the PDF to a file
// 	const pdfBytes = await pdfDoc.save();
// 	// fs.writeFileSync('Pricing.pdf', pdfBytes);
// 	return pdfBytes;
// }