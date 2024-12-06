import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const body = await readBody(event);
		const updatedVessel = await Vessel.findByIdAndUpdate(id, body, {
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
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while updating the vessel.',
		});
	}
});
