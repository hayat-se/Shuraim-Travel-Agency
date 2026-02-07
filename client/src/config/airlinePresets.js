// Predefined airline list with names, IATA codes, regions, and logo URLs
// Logo source: pics.avs.io (airline logo service)

const AIRLINE_PRESETS = [
  // Pakistani Airlines
  { name: 'Pakistan International Airlines', code: 'PK', region: 'Pakistani Airlines', logo: 'https://pics.avs.io/200/80/PK.png' },
  { name: 'Airblue', code: 'PA', region: 'Pakistani Airlines', logo: 'https://pics.avs.io/200/80/PA.png' },
  { name: 'SereneAir', code: 'ER', region: 'Pakistani Airlines', logo: 'https://pics.avs.io/200/80/ER.png' },
  { name: 'AirSial', code: 'PF', region: 'Pakistani Airlines', logo: 'https://pics.avs.io/200/80/PF.png' },
  { name: 'Fly Jinnah', code: '9P', region: 'Pakistani Airlines', logo: 'https://pics.avs.io/200/80/9P.png' },

  // Gulf / Middle East Airlines
  { name: 'Emirates', code: 'EK', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/EK.png' },
  { name: 'Etihad Airways', code: 'EY', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/EY.png' },
  { name: 'Qatar Airways', code: 'QR', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/QR.png' },
  { name: 'Saudi Arabian Airlines (Saudia)', code: 'SV', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/SV.png' },
  { name: 'flynas', code: 'XY', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/XY.png' },
  { name: 'flyadeal', code: 'F3', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/F3.png' },
  { name: 'Gulf Air', code: 'GF', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/GF.png' },
  { name: 'Oman Air', code: 'WY', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/WY.png' },
  { name: 'Kuwait Airways', code: 'KU', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/KU.png' },
  { name: 'Jazeera Airways', code: 'J9', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/J9.png' },
  { name: 'Air Arabia', code: 'G9', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/G9.png' },
  { name: 'FlyDubai', code: 'FZ', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/FZ.png' },
  { name: 'SalamAir', code: 'OV', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/OV.png' },
  { name: 'Iraq Airways', code: 'IA', region: 'Gulf / Middle East', logo: 'https://pics.avs.io/200/80/IA.png' },

  // Turkish
  { name: 'Turkish Airlines', code: 'TK', region: 'Turkish', logo: 'https://pics.avs.io/200/80/TK.png' },
  { name: 'Pegasus Airlines', code: 'PC', region: 'Turkish', logo: 'https://pics.avs.io/200/80/PC.png' },

  // South Asian
  { name: 'Air India', code: 'AI', region: 'South Asian', logo: 'https://pics.avs.io/200/80/AI.png' },
  { name: 'IndiGo', code: '6E', region: 'South Asian', logo: 'https://pics.avs.io/200/80/6E.png' },
  { name: 'SpiceJet', code: 'SG', region: 'South Asian', logo: 'https://pics.avs.io/200/80/SG.png' },
  { name: 'SriLankan Airlines', code: 'UL', region: 'South Asian', logo: 'https://pics.avs.io/200/80/UL.png' },
  { name: 'Biman Bangladesh Airlines', code: 'BG', region: 'South Asian', logo: 'https://pics.avs.io/200/80/BG.png' },
  { name: 'US-Bangla Airlines', code: 'BS', region: 'South Asian', logo: 'https://pics.avs.io/200/80/BS.png' },

  // Southeast & East Asian
  { name: 'Thai Airways', code: 'TG', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/TG.png' },
  { name: 'Malaysia Airlines', code: 'MH', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/MH.png' },
  { name: 'Singapore Airlines', code: 'SQ', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/SQ.png' },
  { name: 'Cathay Pacific', code: 'CX', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/CX.png' },
  { name: 'China Southern Airlines', code: 'CZ', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/CZ.png' },
  { name: 'China Eastern Airlines', code: 'MU', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/MU.png' },
  { name: 'Air China', code: 'CA', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/CA.png' },
  { name: 'Korean Air', code: 'KE', region: 'Southeast & East Asian', logo: 'https://pics.avs.io/200/80/KE.png' },

  // European
  { name: 'British Airways', code: 'BA', region: 'European', logo: 'https://pics.avs.io/200/80/BA.png' },
  { name: 'Lufthansa', code: 'LH', region: 'European', logo: 'https://pics.avs.io/200/80/LH.png' },
  { name: 'Air France', code: 'AF', region: 'European', logo: 'https://pics.avs.io/200/80/AF.png' },
  { name: 'KLM', code: 'KL', region: 'European', logo: 'https://pics.avs.io/200/80/KL.png' },
  { name: 'Swiss International Air Lines', code: 'LX', region: 'European', logo: 'https://pics.avs.io/200/80/LX.png' },
  { name: 'Virgin Atlantic', code: 'VS', region: 'European', logo: 'https://pics.avs.io/200/80/VS.png' },

  // African
  { name: 'Ethiopian Airlines', code: 'ET', region: 'African', logo: 'https://pics.avs.io/200/80/ET.png' },
  { name: 'EgyptAir', code: 'MS', region: 'African', logo: 'https://pics.avs.io/200/80/MS.png' },
  { name: 'Royal Air Maroc', code: 'AT', region: 'African', logo: 'https://pics.avs.io/200/80/AT.png' },
  { name: 'Kenya Airways', code: 'KQ', region: 'African', logo: 'https://pics.avs.io/200/80/KQ.png' },
  { name: 'South African Airways', code: 'SA', region: 'African', logo: 'https://pics.avs.io/200/80/SA.png' },

  // Central Asian
  { name: 'Uzbekistan Airways', code: 'HY', region: 'Central Asian', logo: 'https://pics.avs.io/200/80/HY.png' },
  { name: 'Azerbaijan Airlines', code: 'J2', region: 'Central Asian', logo: 'https://pics.avs.io/200/80/J2.png' },
  { name: 'Kam Air', code: 'RQ', region: 'Central Asian', logo: 'https://pics.avs.io/200/80/RQ.png' },
  { name: 'Ariana Afghan Airlines', code: 'FG', region: 'Central Asian', logo: 'https://pics.avs.io/200/80/FG.png' },
];

// Get unique regions in order
const AIRLINE_REGIONS = [...new Set(AIRLINE_PRESETS.map(a => a.region))];

export { AIRLINE_REGIONS };
export default AIRLINE_PRESETS;
