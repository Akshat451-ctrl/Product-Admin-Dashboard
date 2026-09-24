export const PAGE_SIZES = [10, 20, 50];

export function parsePage(value) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseLimit(value) {
  const n = parseInt(value, 10);
  return PAGE_SIZES.includes(n) ? n : 10;
}
