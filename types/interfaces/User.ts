import type { ObjectId } from 'mongoose';

export interface User {
	_id: ObjectId;
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}
