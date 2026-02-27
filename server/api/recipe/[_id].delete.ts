export default createDeleteHandler(Recipe, {
  referenceChecks: [
    { model: Batch, field: "recipe", label: "batch(es)" },
  ],
});
