import fs from 'node:fs'
import { PDFDocument, PageSizes, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'


export function generatePseudoUUID() {
	const chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
	return chars.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function generateCustomerID() {
	const timestamp = Date.now().toString(36).toUpperCase(); // Convert timestamp to a base-36 string
	const randomNum = Math.random().toString(36).substring(2, 10).toUpperCase(); // Generate a random base-36 string
	return `CUST-${timestamp}-${randomNum}`;
}

export type DataArray = (string | number)[][];
type DataObject = Record<string, string | number>;

export function convertToObjects(array: DataArray): DataObject[] {
	const headers = array[0]; // Extract headers from the first row
	const result = array.slice(1).map(row => {
		const obj: DataObject = { id: generatePseudoUUID() };
		headers.forEach((header, index) => {
			obj[header] = row[index];
		});
		return obj;
	});
	return result;
}

type TableRow = [string, string, string, string];

export interface PricingPDFParams {
	date: string;
	validTill: string;
	customerId: string;
	customer: string;
	projectDescription: string;
	tableData: TableRow[];
	subtotal: number;
	gst: number;
	total: string;
}

export async function createPricingPDF({
	date,
	validTill, customerId,
	customer,
	projectDescription,
	tableData,
	subtotal,
	gst,
	total
}: PricingPDFParams) {
	// Create a new PDF document
	const pdfDoc = await PDFDocument.create();

	pdfDoc.registerFontkit(fontkit);

	const nexBoldBytes = fs.readFileSync("./assets/fonts/Nexa-bold.otf");
	const nexLightBytes = fs.readFileSync("./assets/fonts/Nexa-light.otf");
	const telegrafRegBytes = fs.readFileSync("./assets/fonts/Telegraf-Regular.otf");
	const telegrafUltraBoldBytes = fs.readFileSync("./assets/fonts/Telegraf-Ultrabold.otf");

	const nexaBoldFont = await pdfDoc.embedFont(nexBoldBytes);
	const nexaLightFont = await pdfDoc.embedFont(nexLightBytes);
	const telegrafRegFont = await pdfDoc.embedFont(telegrafRegBytes);
	const telegrafUltraBoldFont = await pdfDoc.embedFont(telegrafUltraBoldBytes);

	// Add a page
	const page = pdfDoc.addPage(PageSizes.A4);
	const { width, height } = page.getSize();

	// Define colors
	const darkBlue = rgb(0.12, 0.16, 0.36);
	const maroon = rgb(0.5, 0, 0);

	// Add the website header
	page.drawText('www.ashcorptechnologies.com', {
		x: 50,
		y: height - 70,
		size: 12,
		font: nexaLightFont,
		color: darkBlue,
	});

	// Add the main title
	page.drawText('Pricing', {
		x: 50,
		y: height - 140,
		size: 42,
		font: nexaBoldFont,
		color: darkBlue,
	});

	page.drawText('ID :', {
		x: width - 240,
		y: height - 71,
		size: 11,
		font: telegrafRegFont,
		color: darkBlue,
	});

	page.drawText(customerId, {
		x: width - 215,
		y: height - 71,
		size: 11,
		font: nexaBoldFont,
		color: darkBlue,
	});


	page.drawText('DATE :', {
		x: 420,
		y: height - 120,
		size: 11,
		font: telegrafRegFont,
		color: darkBlue,
	});

	page.drawText(date, {
		x: 473,
		y: height - 120,
		size: 11,
		font: nexaBoldFont,
		color: darkBlue,
	});

	page.drawText('VALID TILL :', {
		x: 390,
		y: height - 140,
		size: 11,
		font: telegrafRegFont,
		color: darkBlue,
	});

	page.drawText(validTill, {
		x: 473,
		y: height - 140,
		size: 11,
		font: nexaBoldFont,
		color: darkBlue,
	});

	// Draw the customer and project description section
	page.drawText('CUSTOMER', {
		x: 50,
		y: height - 210,
		size: 12,
		font: telegrafUltraBoldFont,
		color: maroon,
	});
	page.drawText(customer, {
		x: 50,
		y: height - 230,
		size: 12,
		font: telegrafRegFont,
		color: darkBlue,
	});
	page.drawText('PROJECT DESCRIPTION:', {
		x: 380,
		y: height - 210,
		size: 12,
		font: telegrafUltraBoldFont,
		color: maroon,
	});
	page.drawText(projectDescription, {
		x: 380,
		y: height - 230,
		size: 12,
		font: telegrafRegFont,
		color: darkBlue,
	});

	page.drawLine({
		start: { x: 50, y: height - 250 },
		end: { x: width - 50, y: height - 250 },
		thickness: 2,
		color: rgb(0.75, 0.2, 0.2),
		opacity: 0.75,
	});

	// Define table headers
	const headers = ['DESCRIPTION', 'QUANTITY', 'PRICE', 'TOTAL'];
	const headerY = height - 280;
	const headerXPositions = [50, 290, 390, 490];
	const cellWidths = [240, 100, 100, 100];

	headers.forEach((text, i) => {
		page.drawText(text, {
			x: headerXPositions[i],
			y: headerY,
			size: 12,
			font: telegrafUltraBoldFont,
			color: darkBlue,
		});
	});

	// Function to split text into lines based on the available width
	function splitTextIntoLines(text: string, maxWidth: any, font: any, fontSize: any) {
		const lines = [];
		let line = '';
		const words = text.split(' ');

		words.forEach(word => {
			const testLine = line + word + ' ';
			const testLineWidth = font.widthOfTextAtSize(testLine, fontSize);

			if (testLineWidth > maxWidth && line !== '') {
				lines.push(line.trim());
				line = word + ' ';
			} else {
				line = testLine;
			}
		});

		if (line.trim() !== '') {
			lines.push(line.trim());
		}

		return lines;
	}

	// Draw table data
	let tableY = headerY - 30;
	const rowHeight = 40;
	tableData.forEach((row: any) => {
		let maxRowHeight = rowHeight;

		// Split text for each cell and calculate row height
		const cellLines = row.map((cellText: string, i: number) => {
			const lines = splitTextIntoLines(cellText, cellWidths[i], telegrafRegFont, 12);
			maxRowHeight = Math.max(maxRowHeight, lines.length * 12);
			return lines;
		});

		// Draw each cell's text
		cellLines.forEach((lines: any, i: number) => {
			lines.forEach((line: any, j: any) => {
				page.drawText(line, {
					x: headerXPositions[i],
					y: tableY - j * 12,
					size: 12,
					font: telegrafRegFont,
					color: darkBlue,
				});
			});
		});

		tableY -= maxRowHeight;
	});


	page.drawLine({
		start: { x: 50, y: tableY - 5 },
		end: { x: width - 50, y: tableY - 5 },
		thickness: 2,
		color: rgb(0.75, 0.2, 0.2),
		opacity: 0.75,
	});

	// Add subtotal and total
	page.drawText('SUBTOTAL:', {
		x: 370,
		y: tableY - 50,
		size: 12,
		font: telegrafUltraBoldFont,
		color: darkBlue,
	});
	page.drawText(subtotal.toString(), {
		x: 470,
		y: tableY - 50,
		size: 12,
		font: telegrafRegFont,
		color: darkBlue,
	});

	// Add gst 
	page.drawText('GST:', {
		x: 370,
		y: tableY - 70,
		size: 12,
		font: telegrafUltraBoldFont,
		color: darkBlue,
	});
	page.drawText(gst.toString(), {
		x: 470,
		y: tableY - 70,
		size: 12,
		font: telegrafRegFont,
		color: darkBlue,
	});
	page.drawText('TOTAL:', {
		x: 370,
		y: tableY - 90,
		size: 12,
		font: telegrafUltraBoldFont,
		color: darkBlue,
	});
	page.drawText(total.toString(), {
		x: 470,
		y: tableY - 90,
		size: 12,
		font: telegrafUltraBoldFont,
		color: darkBlue,
	});

	// Save the PDF to a file
	const pdfBytes = await pdfDoc.save();
	// fs.writeFileSync('Pricing.pdf', pdfBytes);
	return pdfBytes;
}