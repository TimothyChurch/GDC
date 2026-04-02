export default createDeleteHandler(Production, {
  referenceChecks: [
    { model: Batch, field: "stages.bottled.productionRecord", label: "batch(es)" },
  ],
});
