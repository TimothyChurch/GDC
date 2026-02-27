export default createGetAllHandler(Event, {
  populate: "contact",
  sort: { date: -1 },
});
