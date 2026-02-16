export interface GDCEvent {
	_id: string;
	date: string;
	groupSize: number;
	contact: string;
	type: string;
	status: string;
	notes?: string;
	capacity?: number;
	createdAt?: string;
	updatedAt?: string;
}
