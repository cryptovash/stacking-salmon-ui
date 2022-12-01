export type Addressish = string | { address: string };

export function normalizeAddress(value: Addressish) {
  if (typeof (value) !== 'string') {
    value = value.address;
  }
  return value.toLowerCase();
}

export function addressEquals(a: Addressish, b: Addressish) {
  return normalizeAddress(a) === normalizeAddress(b);
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';