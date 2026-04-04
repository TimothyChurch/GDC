import * as yup from 'yup';

const mergeSchema = yup.object({
  primaryId: yup.string().required('Primary contact ID is required'),
  duplicateId: yup.string().required('Duplicate contact ID is required'),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const sanitized = sanitize(body);
  const { primaryId, duplicateId } = await validateBody(sanitized, mergeSchema);

  if (primaryId === duplicateId) {
    throw createError({ status: 400, statusText: 'Cannot merge a contact with itself' });
  }

  validateObjectId(primaryId, 'Primary contact');
  validateObjectId(duplicateId, 'Duplicate contact');

  const [primary, duplicate] = await Promise.all([
    Contact.findById(primaryId),
    Contact.findById(duplicateId),
  ]);

  if (!primary) {
    throw createError({ status: 404, statusText: 'Primary contact not found' });
  }
  if (!duplicate) {
    throw createError({ status: 404, statusText: 'Duplicate contact not found' });
  }

  // Merge missing fields from duplicate into primary (don't overwrite existing data)
  const fillableFields = [
    'firstName', 'lastName', 'businessName', 'website',
    'address', 'email', 'phone', 'city', 'state', 'zip', 'notes',
  ] as const;

  for (const field of fillableFields) {
    if (!primary[field] && duplicate[field]) {
      if (field === 'notes' && primary.notes) {
        // Append duplicate notes instead of overwriting
        primary.notes = `${primary.notes}\n${duplicate.notes}`;
      } else {
        (primary as any)[field] = duplicate[field];
      }
    }
  }

  // Preserve newsletter subscription if either has it
  if (duplicate.newsletter && !primary.newsletter) {
    primary.newsletter = true;
  }

  // Transfer all references from duplicate to primary
  const [eventUpdates, bookingUpdates, messageUpdates, poUpdates] = await Promise.all([
    // Events where duplicate is the main contact
    Event.updateMany(
      { contact: duplicateId },
      { $set: { contact: primaryId } },
    ),
    // Event bookings where duplicate is the booking contact
    Event.updateMany(
      { 'bookings.contact': duplicateId },
      { $set: { 'bookings.$[elem].contact': primaryId } },
      { arrayFilters: [{ 'elem.contact': duplicateId }] },
    ),
    // Messages referencing the duplicate
    Message.updateMany(
      { contact: duplicateId },
      { $set: { contact: primaryId } },
    ),
    // Purchase orders where duplicate is the vendor
    PurchaseOrder.updateMany(
      { vendor: duplicateId },
      { $set: { vendor: primaryId } },
    ),
  ]);

  await primary.save();
  await Contact.findByIdAndDelete(duplicateId);

  return {
    merged: primary.toObject(),
    transferred: {
      events: eventUpdates.modifiedCount,
      bookings: bookingUpdates.modifiedCount,
      messages: messageUpdates.modifiedCount,
      purchaseOrders: poUpdates.modifiedCount,
    },
  };
});
