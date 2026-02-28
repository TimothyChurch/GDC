export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sanitized = sanitize(body);
	const validated = await validateBody(sanitized, contactInquirySchema);

	try {
		// Check if this email already exists as a contact
		let contactId: string | undefined;
		const existing = await Contact.findOne({ email: validated.email });
		if (existing) {
			contactId = existing._id.toString();

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
		} else {
			const newContact = await Contact.create({
				firstName: validated.firstName,
				lastName: validated.lastName,
				email: validated.email,
				phone: validated.phone || undefined,
				type: 'Inquiry',
				notes: `[${validated.topic}] ${validated.message}`,
			});
			contactId = newContact._id.toString();
		}

		// Create a Message document for the admin inbox
		await Message.create({
			contact: contactId,
			firstName: validated.firstName,
			lastName: validated.lastName,
			email: validated.email,
			phone: validated.phone || undefined,
			topic: validated.topic,
			message: validated.message,
		});

		return { success: true, message: "Thanks for reaching out! We'll get back to you soon." };
	} catch (error) {
		throw createError({ statusCode: 500, statusMessage: 'Failed to submit inquiry' });
	}
});
