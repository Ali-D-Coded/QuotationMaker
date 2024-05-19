import { google } from "googleapis";
import { DataArray, convertToObjects } from "~/utils/fun";

export default defineEventHandler(async (event) => {
	const base64Config = process.env.GOOGLE_APPLICATION_CREDENTIALS;
	let keyFile = null
	if (base64Config) {
		try {
			const decodedConfig = Buffer.from(base64Config, 'base64').toString('utf-8');
			keyFile = JSON.parse(decodedConfig);
		} catch (error) {
			console.error("Failed to decode or parse configuration:", error);
		}
	} else {
		console.error("Configuration environment variable is missing");
	}

	const auth = new google.auth.GoogleAuth({
		// keyFile: keyFile,
		credentials: keyFile,
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