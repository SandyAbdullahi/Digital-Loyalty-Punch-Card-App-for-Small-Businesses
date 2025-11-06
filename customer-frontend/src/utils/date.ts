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

  // Parse the date - JavaScript automatically handles ISO strings with timezone info
  const date = new Date(normalised);

  // If the date is invalid, return null
  if (Number.isNaN(date.getTime())) return null;

  // If the original string indicates UTC (+00:00, +0000, Z), ensure it's treated as UTC
  if (normalised.includes('+00:00') || normalised.includes('+0000') || normalised.includes('Z')) {
    // The date is already correctly parsed as UTC and will convert to local time with toLocaleString
    return date;
  }

  return date;
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
