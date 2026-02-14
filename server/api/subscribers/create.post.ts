import * as yup from 'yup';

const subscriberSchema = yup.object({
	email: yup.string().email('Invalid email').required('Email is required'),
});

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	const validated = await validateBody(sanitized, subscriberSchema);

	try {
		const existing = await Subscriber.findOne({ email: validated.email });
		if (existing) {
			return { success: true, message: 'Already subscribed' };
		}
		await Subscriber.create({ email: validated.email });
		return { success: true, message: 'Subscribed successfully' };
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to subscribe' });
	}
});
