export default createGetAllHandler(Message, {
  sort: { createdAt: -1 },
});
