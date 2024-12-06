import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	try {
		const id = event.context.params?.id;
		const deletedVessel = await Vessel.findByIdAndDelete(id);
		if (!deletedVessel) {
			throw createError({
				statusCode: 404,
				statusMessage: 'Vessel not found',
			});
		}
		return { message: 'Vessel deleted successfully' };
	} catch (error) {
		console.error(error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while deleting the vessel.',
		});
	}
});
