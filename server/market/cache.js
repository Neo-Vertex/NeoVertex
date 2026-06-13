// Cache TTL simples em memória, com clock injetável para testes.
function makeCache(ttlMs, now = () => Date.now()) {
  const store = new Map();
  return {
    get(key) {
      const e = store.get(key);
      if (!e) return undefined;
      if (now() - e.t > ttlMs) { store.delete(key); return undefined; }
      return e.v;
    },
    set(key, v) { store.set(key, { v, t: now() }); return v; },
  };
}

module.exports = { makeCache };
