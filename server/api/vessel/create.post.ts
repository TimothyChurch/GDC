import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	await validateBody(body, vesselCreateSchema);
	const sanitized = sanitize(body);
	try {
		const newVessel = new Vessel(sanitized);
		await newVessel.save();
		return newVessel;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while creating a new vessel.',
		});
	}
});
