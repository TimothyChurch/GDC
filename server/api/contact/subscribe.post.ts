export default defineEventHandler(async (event) => {
	rateLimit(event, {
		key: 'contact:subscribe',
		limit: 5,
		windowMs: 15 * 60 * 1000,
		message: 'Too many subscription attempts. Please try again later.',
	});

	const body = await readBody(event);
	const sanitized = sanitize(body);
	const validated = await validateBody(sanitized, newsletterSubscribeSchema);

	try {
		const existing = await GDCContact.findOne({ email: validated.email });
		if (existing) {
			await GDCContact.findByIdAndUpdate(existing._id, { newsletter: true, type: 'Customer' });
			return { success: true, message: 'You\'re now subscribed to our newsletter!' };
		}

		await GDCContact.create({
			email: validated.email,
			firstName: validated.firstName || undefined,
			lastName: validated.lastName || undefined,
			phone: validated.phone || undefined,
			type: 'Customer',
			newsletter: true,
		});
		return { success: true, message: 'Thanks for subscribing!' };
	} catch (error) {
		throw createError({ status: 500, statusText: 'Failed to subscribe' });
	}
});
