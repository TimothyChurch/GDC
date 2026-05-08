interface NamedContact {
	businessName?: string | null;
	firstName?: string | null;
	lastName?: string | null;
}

/**
 * Display name for a contact: `businessName` if set, otherwise `firstName lastName`.
 * Falls back to empty string if all three are missing.
 */
export function formatContactName(contact: NamedContact | null | undefined): string {
	if (!contact) return '';
	if (contact.businessName) return contact.businessName;
	const first = contact.firstName ?? '';
	const last = contact.lastName ?? '';
	return `${first} ${last}`.trim();
}
