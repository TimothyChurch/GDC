export interface EventAddOn {
	name: string;
	price: number; // cents
	description?: string;
}

export interface EventBooking {
	contact: string;
	name: string;
	email: string;
	quantity: number;
	amount: number;
	orderId: string;
	bookedAt: string;
}

export interface GDCEvent {
	_id: string;
	date: string;
	groupSize: number;
	contact: string;
	type: string;
	status: string;
	notes?: string;
	capacity?: number;
	isPublic?: boolean;
	price?: number; // per-person price in cents
	addOns?: EventAddOn[];
	bookings?: EventBooking[];
	processedOrders?: string[];
	createdAt?: string;
	updatedAt?: string;
}
