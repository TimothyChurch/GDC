export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, contactCreateSchema);
	const sanitized = sanitize(body);
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
