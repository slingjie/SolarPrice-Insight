const SUFFIXES = [
  '特别行政区',
  '维吾尔自治区',
  '壮族自治区',
  '回族自治区',
  '自治区',
  '省',
  '市',
];

export function normalizeProvinceName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '';
  if (trimmed === '全部') return '全部';

  for (const suffix of SUFFIXES) {
    if (trimmed.endsWith(suffix)) {
      return trimmed.slice(0, trimmed.length - suffix.length);
    }
  }
  return trimmed;
}

export function provinceMatches(a: string, b: string): boolean {
  const na = normalizeProvinceName(a);
  const nb = normalizeProvinceName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}
