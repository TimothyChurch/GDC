import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	try {
		const body = await readBody(event);
		const newVessel = new Vessel(body);
		await newVessel.save();
		return newVessel;
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while creating a new vessel.',
		});
	}
});
