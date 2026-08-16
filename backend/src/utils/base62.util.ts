const BASE62_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BigInt(BASE62_ALPHABET.length);

export function encodeBase62(num: bigint): string {
  if (num === 0n) return BASE62_ALPHABET[0];

  let result = '';
  let n = num;

  while (n > 0n) {
    const remainder = n % BASE;
    result = BASE62_ALPHABET[Number(remainder)] + result;
    n = n / BASE;
  }

  return result;
}