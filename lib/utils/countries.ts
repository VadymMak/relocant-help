export const COUNTRY_META: Record<string, { flag: string; label: string }> = {
  'Slovakia':         { flag: '🇸🇰', label: 'SK' },
  'Poland':           { flag: '🇵🇱', label: 'PL' },
  'Germany':          { flag: '🇩🇪', label: 'DE' },
  'Czech Republic':   { flag: '🇨🇿', label: 'CZ' },
  'European Union':   { flag: '🇪🇺', label: 'EU' },
  'Spain':            { flag: '🇪🇸', label: 'ES' },
  'Italy':            { flag: '🇮🇹', label: 'IT' },
  'Romania':          { flag: '🇷🇴', label: 'RO' },
  'Bulgaria':         { flag: '🇧🇬', label: 'BG' },
  'Portugal':         { flag: '🇵🇹', label: 'PT' },
  'Turkey':           { flag: '🇹🇷', label: 'TR' },
  'Austria':          { flag: '🇦🇹', label: 'AT' },
  'Netherlands':      { flag: '🇳🇱', label: 'NL' },
  'France':           { flag: '🇫🇷', label: 'FR' },
  'Denmark':          { flag: '🇩🇰', label: 'DK' },
  'Norway':           { flag: '🇳🇴', label: 'NO' },
  'Sweden':           { flag: '🇸🇪', label: 'SE' },
  'Finland':          { flag: '🇫🇮', label: 'FI' },
  'Belgium':          { flag: '🇧🇪', label: 'BE' },
  'Hungary':          { flag: '🇭🇺', label: 'HU' },
  'Ukraine':          { flag: '🇺🇦', label: 'UA' },
  'United Kingdom':   { flag: '🇬🇧', label: 'GB' },
}

export function getCountryMeta(country: string): { flag: string; label: string } {
  return COUNTRY_META[country] ?? {
    flag: '🌍',
    label: country.slice(0, 2).toUpperCase(),
  }
}
