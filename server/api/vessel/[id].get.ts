import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const vessel = await Vessel.findById(id).lean();
		if (!vessel) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Vessel not found',
			});
		}
		return vessel;
	} catch (error: any) {
		if (error.statusCode) throw error;
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while fetching the vessel.',
		});
	}
});
