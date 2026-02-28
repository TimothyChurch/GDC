export interface Message {
	_id: string;
	contact?: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	topic: string;
	message: string;
	read: boolean;
	createdAt?: string;
	updatedAt?: string;
}
