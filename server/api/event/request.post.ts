export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validated = await validateBody(body, eventRequestSchema);
  const sanitized = sanitize(validated);

  try {
    // Find or create contact by email
    let contact = await Contact.findOne({ email: sanitized.email });
    if (contact) {
      // Update name/phone if provided
      await Contact.findByIdAndUpdate(contact._id, {
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        ...(sanitized.phone && { phone: sanitized.phone }),
      });
    } else {
      contact = await Contact.create({
        firstName: sanitized.firstName,
        lastName: sanitized.lastName,
        email: sanitized.email,
        phone: sanitized.phone || undefined,
        type: "Customer",
      });
    }

    // Create the event
    await Event.create({
      date: sanitized.date,
      groupSize: sanitized.groupSize,
      contact: contact._id,
      type: sanitized.type,
      status: "Pending",
      notes: sanitized.notes || undefined,
    });

    return {
      success: true,
      message: "Your request has been submitted! We'll be in touch soon.",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to submit request",
    });
  }
});
