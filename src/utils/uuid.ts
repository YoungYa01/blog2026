export function generateUUID(): string {
  const g = globalThis as typeof globalThis & {
    msCrypto?: Crypto;
  };

  const cryptoObj = g.crypto || g.msCrypto;

  // 优先使用浏览器原生 randomUUID
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }

  // 兼容没有 randomUUID 的环境，使用 getRandomValues 生成 UUID v4
  if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);

    // UUID v4 固定版本位
    bytes[6] = (bytes[6] & 0x0f) | 0x40;

    // UUID variant 固定位
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));

    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }

  // 最后兜底：只建议用于 userId、临时 sessionId，不要用于安全 token
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}