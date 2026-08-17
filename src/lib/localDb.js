const PREFIX = 'bmori_db_v1_';

// Minimal localStorage CRUD helper.
// Simulates a backend while the real API isn't available.
// All reads return the seeded data on first call; all writes are synchronous.
//
// get(key, seed, version) — pass a version string/number whenever you change the
// seed data. If the stored version doesn't match, the key is reset to the new seed
// automatically (no manual localStorage clearing needed).
export const localDb = {
  get(key, seed = [], version = null) {
    try {
      if (version !== null) {
        const vKey = PREFIX + key + '__v';
        if (localStorage.getItem(vKey) !== String(version)) {
          localStorage.setItem(vKey, String(version));
          localStorage.setItem(PREFIX + key, JSON.stringify(seed));
          return seed;
        }
      }
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) {
        localStorage.setItem(PREFIX + key, JSON.stringify(seed));
        return seed;
      }
      return JSON.parse(raw);
    } catch {
      return seed;
    }
  },

  set(key, data) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(data));
    } catch {}
  },

  reset(key) {
    localStorage.removeItem(PREFIX + key);
    localStorage.removeItem(PREFIX + key + '__v');
  },

  resetAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};
