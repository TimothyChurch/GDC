export interface EquipmentLog {
	_id: string;
	equipment: string;
	action: string;
	value?: number;
	timestamp: string | Date;
	batch?: string | null;
	createdAt?: string;
	updatedAt?: string;
}
