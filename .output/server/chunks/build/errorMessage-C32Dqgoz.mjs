function getErrorMessage(error) {
  if (error && typeof error === "object") {
    const e = error;
    const data = e.data;
    if (data) {
      if (typeof data.statusMessage === "string") return data.statusMessage;
      if (typeof data.message === "string") return data.message;
    }
    if (typeof e.message === "string") return e.message;
  }
  if (typeof error === "string") return error;
  return "Unknown error";
}

export { getErrorMessage as g };
//# sourceMappingURL=errorMessage-C32Dqgoz.mjs.map
