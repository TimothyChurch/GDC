import type { ObjectId } from 'mongoose';

export interface Contact {
	_id: ObjectId;
	firstName: string;
	lastName: string;
	businessName: string;
	type: string;
	website: string;
	address: string;
	email: string;
	phone: string;
}
