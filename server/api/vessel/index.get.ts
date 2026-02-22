import { Vessel } from '~/server/models/vessel.schema';

export default defineEventHandler(async (event) => {
	try {
		const vessels = await Vessel.find().lean();
		return vessels;
	} catch (error) {
		throw createError({
			statusCode: 500,
			statusMessage: 'Server error occurred while fetching vessels.',
		});
	}
});
