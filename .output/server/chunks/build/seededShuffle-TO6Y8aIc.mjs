function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seededShuffle(items, seed) {
  const result = [...items];
  const random = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function todaySeed() {
  const now = /* @__PURE__ */ new Date();
  return now.getUTCFullYear() * 1e4 + (now.getUTCMonth() + 1) * 100 + now.getUTCDate();
}

export { seededShuffle as s, todaySeed as t };
//# sourceMappingURL=seededShuffle-TO6Y8aIc.mjs.map
