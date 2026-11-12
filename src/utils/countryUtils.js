const COUNTRY_ID_BY_SLUG = {
  portugal: 1,
  netherlands: 2,
  germany: 3,
  unitedstates: 4,
  unitedkingdom: 5,
  canada: 6,
  france: 7,
  spain: 8,
};

const COUNTRY_ID_BY_NAME = Object.fromEntries(
  Object.entries(COUNTRY_ID_BY_SLUG).map(([slug, id]) => [slug.replace(/([a-z])([A-Z])/g, "$1 $2"), id])
);

export const normalizeCountryId = (countryValue) => {
  if (countryValue === null || countryValue === undefined || countryValue === "") {
    return null;
  }

  if (typeof countryValue === "object") {
    return normalizeCountryId(countryValue.id ?? countryValue.countryId ?? countryValue.country_id);
  }

  if (typeof countryValue === "string") {
    const trimmed = countryValue.trim();

    if (!trimmed) {
      return null;
    }

    if (trimmed.toLowerCase() === "all") {
      return null;
    }

    const numericValue = Number(trimmed);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const normalizedText = trimmed.toLowerCase().replace(/[^a-z]/g, "");
    if (COUNTRY_ID_BY_SLUG[normalizedText]) {
      return COUNTRY_ID_BY_SLUG[normalizedText];
    }

    const fallbackMatch = Object.entries(COUNTRY_ID_BY_NAME).find(([name]) =>
      name.toLowerCase() === trimmed.toLowerCase()
    );

    if (fallbackMatch) {
      return fallbackMatch[1];
    }

    return trimmed;
  }

  const numericValue = Number(countryValue);
  return Number.isFinite(numericValue) ? numericValue : countryValue;
};

export const getCountryIdFromSession = (session) => normalizeCountryId(session?.country);
