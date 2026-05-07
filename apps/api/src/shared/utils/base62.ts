const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(ALPHABET.length); // 62

/**
 * Encode a non-negative integer to a Base62 string.
 * 62^6 = 56,800,235,584 — enough for billions of URLs.
 */
export function encodeBase62(num: number | bigint): string {
  let n = BigInt(num);

  if (n === 0n) return ALPHABET[0];

  const chars: string[] = [];
  while (n > 0n) {
    chars.unshift(ALPHABET[Number(n % BASE)]);
    n = n / BASE;
  }
  return chars.join('');
}

/**
 * Decode a Base62 string back to a BigInt.
 */
export function decodeBase62(str: string): bigint {
  let result = 0n;
  for (const char of str) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base62 character: ${char}`);
    result = result * BASE + BigInt(index);
  }
  return result;
}
