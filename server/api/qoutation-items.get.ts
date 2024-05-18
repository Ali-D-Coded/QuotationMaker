import { google } from "googleapis";
import { DataArray, convertToObjects } from "~/utils/fun";

export default defineEventHandler(async (event) => {
	const auth = new google.auth.GoogleAuth({
		keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
		scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
	});

	const sheets = google.sheets({
		version: "v4",
		auth: auth
	});

	const sheetId = process.env.SHEET_ID; // Replace with your actual sheet ID
	const range = 'Sheet1!A:B';
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: sheetId,
		range
	})
	const dt = convertToObjects(res.data.values as DataArray)




	return dt
})