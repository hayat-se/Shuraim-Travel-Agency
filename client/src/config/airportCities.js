// Airport cities for Gulf countries + Pakistan
// Only cities with commercial airports

const AIRPORT_CITIES = [
  // Pakistan
  { city: 'Islamabad', code: 'ISB', country: 'Pakistan' },
  { city: 'Lahore', code: 'LHE', country: 'Pakistan' },
  { city: 'Karachi', code: 'KHI', country: 'Pakistan' },
  { city: 'Peshawar', code: 'PEW', country: 'Pakistan' },
  { city: 'Quetta', code: 'UET', country: 'Pakistan' },
  { city: 'Faisalabad', code: 'LYP', country: 'Pakistan' },
  { city: 'Multan', code: 'MUX', country: 'Pakistan' },
  { city: 'Sialkot', code: 'SKT', country: 'Pakistan' },
  { city: 'Rahim Yar Khan', code: 'RYK', country: 'Pakistan' },
  { city: 'Bahawalpur', code: 'BHV', country: 'Pakistan' },
  { city: 'Sukkur', code: 'SKZ', country: 'Pakistan' },
  { city: 'Nawabshah', code: 'WNS', country: 'Pakistan' },
  { city: 'Turbat', code: 'TUK', country: 'Pakistan' },
  { city: 'Gwadar', code: 'GWD', country: 'Pakistan' },
  { city: 'Gilgit', code: 'GIL', country: 'Pakistan' },
  { city: 'Skardu', code: 'KDU', country: 'Pakistan' },
  { city: 'Chitral', code: 'CJL', country: 'Pakistan' },
  { city: 'Dera Ismail Khan', code: 'DSK', country: 'Pakistan' },
  { city: 'Dera Ghazi Khan', code: 'DEA', country: 'Pakistan' },

  // Saudi Arabia (KSA)
  { city: 'Jeddah', code: 'JED', country: 'Saudi Arabia' },
  { city: 'Riyadh', code: 'RUH', country: 'Saudi Arabia' },
  { city: 'Dammam', code: 'DMM', country: 'Saudi Arabia' },
  { city: 'Medina', code: 'MED', country: 'Saudi Arabia' },
  { city: 'Abha', code: 'AHB', country: 'Saudi Arabia' },
  { city: 'Tabuk', code: 'TUU', country: 'Saudi Arabia' },
  { city: 'Taif', code: 'TIF', country: 'Saudi Arabia' },
  { city: 'Hail', code: 'HAS', country: 'Saudi Arabia' },
  { city: 'Jazan', code: 'GIZ', country: 'Saudi Arabia' },
  { city: 'Al Baha', code: 'ABT', country: 'Saudi Arabia' },
  { city: 'Najran', code: 'EAM', country: 'Saudi Arabia' },
  { city: 'Qassim (Buraidah)', code: 'ELQ', country: 'Saudi Arabia' },
  { city: 'Al Jouf (Sakaka)', code: 'AJF', country: 'Saudi Arabia' },
  { city: 'Yanbu', code: 'YNB', country: 'Saudi Arabia' },
  { city: 'Al Ula', code: 'ULH', country: 'Saudi Arabia' },
  { city: 'Arar', code: 'RAE', country: 'Saudi Arabia' },
  { city: 'Neom Bay', code: 'NUM', country: 'Saudi Arabia' },

  // UAE
  { city: 'Dubai', code: 'DXB', country: 'UAE' },
  { city: 'Abu Dhabi', code: 'AUH', country: 'UAE' },
  { city: 'Sharjah', code: 'SHJ', country: 'UAE' },
  { city: 'Ras Al Khaimah', code: 'RKT', country: 'UAE' },
  { city: 'Al Ain', code: 'AAN', country: 'UAE' },

  // Qatar
  { city: 'Doha', code: 'DOH', country: 'Qatar' },

  // Bahrain
  { city: 'Bahrain (Manama)', code: 'BAH', country: 'Bahrain' },

  // Oman
  { city: 'Muscat', code: 'MCT', country: 'Oman' },
  { city: 'Salalah', code: 'SLL', country: 'Oman' },
  { city: 'Duqm', code: 'DQM', country: 'Oman' },
  { city: 'Sohar', code: 'OHS', country: 'Oman' },

  // Kuwait
  { city: 'Kuwait City', code: 'KWI', country: 'Kuwait' },

  // Iraq
  { city: 'Baghdad', code: 'BGW', country: 'Iraq' },
  { city: 'Erbil', code: 'EBL', country: 'Iraq' },
  { city: 'Basra', code: 'BSR', country: 'Iraq' },
  { city: 'Sulaymaniyah', code: 'ISU', country: 'Iraq' },
  { city: 'Najaf', code: 'NJF', country: 'Iraq' },
];

// Group by country for optgroup display
const AIRPORT_COUNTRIES = [...new Set(AIRPORT_CITIES.map(a => a.country))];

export { AIRPORT_COUNTRIES };
export default AIRPORT_CITIES;
