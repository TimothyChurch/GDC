export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	const validated = await validateBody(sanitized, contactInquirySchema);

	try {
		// Check if this email already exists as a contact
		const existing = await Contact.findOne({ email: validated.email });
		if (existing) {
			// Update existing contact with inquiry info in notes
			const notePrefix = `[${validated.topic}] `;
			const existingNotes = existing.notes || '';
			const newNote = notePrefix + validated.message;
			const updatedNotes = existingNotes
				? `${newNote}\n---\n${existingNotes}`
				: newNote;

			await Contact.findByIdAndUpdate(existing._id, {
				notes: updatedNotes,
				firstName: validated.firstName || existing.firstName,
				lastName: validated.lastName || existing.lastName,
				phone: validated.phone || existing.phone,
			});

			return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
		}

		await Contact.create({
			firstName: validated.firstName,
			lastName: validated.lastName,
			email: validated.email,
			phone: validated.phone || undefined,
			type: 'Inquiry',
			notes: `[${validated.topic}] ${validated.message}`,
		});

		return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to submit inquiry' });
	}
});
