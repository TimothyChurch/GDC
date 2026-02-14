import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const vessel = await Vessel.findById(id);
		if (!vessel) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Vessel not found',
			});
		}
		return vessel;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while fetching the vessel.',
		});
	}
});
