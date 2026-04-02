export default createDeleteHandler(Batch, {
	referenceChecks: [
		{ model: BulkSpirit, field: 'batch', label: 'bulk spirit(s)' },
		{ model: EquipmentLog, field: 'batch', label: 'equipment log(s)' },
		{ model: Vessel, field: 'contents.batch', label: 'vessel(s)' },
	],
});
