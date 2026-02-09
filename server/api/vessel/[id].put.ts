import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id;
	const body = await readBody(event);
	const sanitized = sanitize(body);
	try {
		const updatedVessel = await Vessel.findByIdAndUpdate(id, sanitized, {
			new: true,
		});
		if (!updatedVessel) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Vessel not found',
			});
		}
		return updatedVessel;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while updating the vessel.',
		});
	}
});
