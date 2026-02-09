import * as yup from 'yup';

/**
 * Recursively strip keys starting with '$' to prevent NoSQL injection.
 * Also ensures the result is a plain object (no prototype pollution).
 */
export function sanitize<T extends Record<string, any>>(obj: T): T {
	if (obj === null || obj === undefined) return obj;
	if (typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map(sanitize) as unknown as T;

	const result: Record<string, any> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (key.startsWith('$')) continue;
		if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
		result[key] = typeof value === 'object' ? sanitize(value) : value;
	}
	return result as T;
}

/**
 * Validate request body against a Yup schema.
 * Throws a 400 error with validation messages on failure.
 */
export async function validateBody(
	body: unknown,
	schema: yup.ObjectSchema<any>
): Promise<any> {
	try {
		return await schema.validate(body, { abortEarly: false });
	} catch (error) {
		if (error instanceof yup.ValidationError) {
			throw createError({
				statusCode: 400,
				statusMessage: 'Validation Error',
				data: error.errors,
			});
		}
		throw error;
	}
}

// ─── Resource Schemas ────────────────────────────────────────

export const userCreateSchema = yup.object({
	email: yup.string().email('Invalid email').required('Email is required'),
	password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	phoneNumber: yup.string(),
});

export const userLoginSchema = yup.object({
	email: yup.string().email('Invalid email').required('Email is required'),
	password: yup.string().required('Password is required'),
});

export const batchCreateSchema = yup.object({
	recipe: yup.string().required('Recipe is required'),
	batchSize: yup.number().positive('Must be greater than 0').required('Batch size is required'),
	batchSizeUnit: yup.string().required('Unit is required'),
});

export const bottleCreateSchema = yup.object({
	name: yup.string().required('Name is required'),
	abv: yup.number().min(0, 'ABV cannot be negative').max(100, 'ABV cannot exceed 100'),
	price: yup.number().min(0, 'Price cannot be negative'),
});

export const cocktailCreateSchema = yup.object({
	name: yup.string().required('Name is required'),
	price: yup.number().min(0, 'Price cannot be negative'),
});

export const contactCreateSchema = yup.object({
	businessName: yup.string().required('Business name is required'),
	type: yup.string().required('Type is required'),
	email: yup.string().email('Invalid email'),
});

export const inventoryCreateSchema = yup.object({
	date: yup.date().required('Date is required'),
});

export const itemCreateSchema = yup.object({
	name: yup.string().required('Name is required'),
	pricePerUnit: yup.number().min(0, 'Price cannot be negative'),
});

export const productionCreateSchema = yup.object({
	date: yup.date().required('Date is required'),
	bottle: yup.string().required('Bottle is required'),
	quantity: yup.number().positive('Must be greater than 0').required('Quantity is required'),
});

export const purchaseOrderCreateSchema = yup.object({
	vendor: yup.string().required('Vendor is required'),
	date: yup.date().required('Date is required'),
});

export const recipeCreateSchema = yup.object({
	name: yup.string().required('Name is required'),
});

export const vesselCreateSchema = yup.object({
	name: yup.string().required('Name is required'),
	type: yup.string().required('Type is required'),
});
