// src/utils/setImmediatePolyfill.js
if (typeof globalThis.setImmediate === "undefined") {
  globalThis.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}
