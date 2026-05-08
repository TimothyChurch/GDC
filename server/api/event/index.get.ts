export default createGetAllHandler(GDCEvent, {
  populate: "contact",
  sort: { date: -1 },
});
