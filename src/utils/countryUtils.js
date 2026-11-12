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
    return Number.isFinite(numericValue) ? numericValue : trimmed;
  }

  const numericValue = Number(countryValue);
  return Number.isFinite(numericValue) ? numericValue : countryValue;
};

export const getCountryIdFromSession = (session) => normalizeCountryId(session?.country);
