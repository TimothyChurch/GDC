export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, contactCreateSchema);
	try {
		const newContact = new Contact(sanitized);
		await newContact.save();
		return newContact;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to create contact",
		});
	}
});
