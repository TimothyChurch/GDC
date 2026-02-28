export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	const validated = await validateBody(sanitized, newsletterSubscribeSchema);

	try {
		const existing = await Contact.findOne({ email: validated.email });
		if (existing) {
			await Contact.findByIdAndUpdate(existing._id, { newsletter: true, type: 'Customer' });
			return { success: true, message: 'You\'re now subscribed to our newsletter!' };
		}

		await Contact.create({
			email: validated.email,
			firstName: validated.firstName || undefined,
			lastName: validated.lastName || undefined,
			phone: validated.phone || undefined,
			type: 'Customer',
			newsletter: true,
		});
		return { success: true, message: 'Thanks for subscribing!' };
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to subscribe' });
	}
});
