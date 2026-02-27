export default createGetAllHandler(EquipmentLog, {
  sort: { timestamp: -1 },
  limit: 50,
});
