import { z } from "zod";

export const generateQoutaion = z.object({
	date: z.string(),
	customerId: z.string(),
	validTill: z.string(),
	customer: z.string(),
	projectDescription: z.string(),
	subtotal: z.string(),
	gst: z.string(),
	total: z.string(),
	tableData: z.array(z.array(z.string()))
})