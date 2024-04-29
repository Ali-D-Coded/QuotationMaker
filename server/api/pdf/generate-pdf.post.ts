// file: ~/server/api/pdf/my-pdf.vue
import { createPDF, streamReturnPDF } from '#pdf'
import fs from 'node:fs'
import puppeteer from 'puppeteer';
import { replacePage } from '~/utils/fun';

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	console.log({ body });
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()
	await page.setContent(`
	<html>
	<body>
	<h1>Hello world</h1>
	</body>
	</html>
	`, { waitUntil: "domcontentloaded" })

	const pdfbuffer = await page.pdf({
		format: "A4",
		path: "./pdf/quotation.pdf",
		printBackground: true
	})

	await browser.close()



	const filename = 'quotation.pdf';

	// Set the headers to trigger a file download
	setResponseHeaders(event, {
		'Content-Disposition': `attachment; filename="${filename}"`,
		'Content-Type': 'application/pdf' // S
	})


	await replacePage('/pdf/quotationmain.pdf', '/pdf/quotation.pdf')

	return sendStream(event, fs.createReadStream('./pdf/quotation.pdf'))
})
