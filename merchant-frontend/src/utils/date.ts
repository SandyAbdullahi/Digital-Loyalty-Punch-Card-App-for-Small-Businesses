const ISO_LIKE_REGEX = /^\d{4}-\d{2}-\d{2}/;

const normaliseApiDateString = (value: string) => {
  let next = value.trim();
  if (!next) return next;

  if (ISO_LIKE_REGEX.test(next) && next.includes(' ') && !next.includes('T')) {
    next = next.replace(' ', 'T');
  }

  return next;
};

export const parseApiDate = (value?: string | null) => {
  if (!value) return null;
  const normalised = normaliseApiDateString(value);
  const date = new Date(normalised);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatApiDate = (
  value?: string | null,
  options?: Intl.DateTimeFormatOptions,
  fallback = ''
) => {
  const date = parseApiDate(value);
  if (!date) return fallback;
  return date.toLocaleString(undefined, options);
};
