export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	await validateBody(sanitized, contactUpdateSchema);
	try {
		const updatedContact = await Contact.findByIdAndUpdate(id, sanitized, {
			new: true,
		});
		if (!updatedContact) {
			throw createError({
				statusCode: 404,
				statusMessage: "Contact not found",
			});
		}
		return updatedContact;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: "Failed to update contact",
		});
	}
});
