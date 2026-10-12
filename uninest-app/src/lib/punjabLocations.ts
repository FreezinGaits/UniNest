/**
 * Punjab Cities and Localities Database for UniNest
 * Provides complete coverage of all Punjab districts, major student corridors & campus vicinities.
 */

export interface CityLocationData {
  city: string;
  isMajorStudentHub: boolean;
  localities: string[];
}

export const PUNJAB_CITIES_DATA: CityLocationData[] = [
  {
    city: 'Ludhiana',
    isMajorStudentHub: true,
    localities: [
      'Ferozepur Road (PCTE Vicinity)',
      'BRS Nagar (PAU Vicinity)',
      'Sarabha Nagar',
      'Model Town',
      'Gill Road (GNDEC Vicinity)',
      'Baddowal (PCTE Main Campus)',
      'Kali Sadak / Jalandhar Bypass',
      'Aggar Nagar',
      'Civil Lines',
      'Dugri & Phase 1/2',
      'South City',
      'Ghumar Mandi',
      'Pakhowal Road',
      'Haibowal Kalan',
      'Focal Point & Chandigarh Road',
      'Samrala Chowk',
      'Shivpuri & Noorwala Road',
      'Rahon Road',
      'Sundar Nagar',
      'Kitchlu Nagar',
      'Shaheed Bhagat Singh Nagar',
      'Raja Garden & Barewal Road',
    ],
  },
  {
    city: 'Jalandhar',
    isMajorStudentHub: true,
    localities: [
      'Rama Mandi (NIT Vicinity)',
      'Model Town',
      'Jalandhar Cantt',
      'GT Road / PAP Complex',
      'Urban Estate Phase 1/2',
      'Choggitti',
      'Ladowali Road (DAV College)',
      'Guru Nanak Mission Chowk',
      'BMC Chowk & Nakodar Road',
      'Suranussi',
    ],
  },
  {
    city: 'Amritsar',
    isMajorStudentHub: true,
    localities: [
      'GNDU Campus Vicinity',
      'Ranjit Avenue',
      'Majitha Road',
      'Mall Road & Lawrence Road',
      'Chheharta',
      'Batala Road',
      'Putligarh',
      'Airport Road',
    ],
  },
  {
    city: 'Patiala',
    isMajorStudentHub: true,
    localities: [
      'Thapar University Vicinity',
      'Punjabi University Campus Road',
      'Urban Estate Phase 1/2',
      'Lehal & Rajpura Road',
      'Model Town',
      'Tripuri',
      'Baradari Gardens Vicinity',
    ],
  },
  {
    city: 'Bathinda',
    isMajorStudentHub: true,
    localities: [
      'AIIMS & Central University Vicinity',
      'Giani Zail Singh Campus (MRSPTU)',
      'Model Town Phase 1/2/3',
      'Mall Road & Civil Lines',
      'Goniana Road',
      'Power House Road',
    ],
  },
  {
    city: 'Mohali (SAS Nagar)',
    isMajorStudentHub: true,
    localities: [
      'Sector 68 to 82 (IT Park)',
      'Kharar - Landran Road (CU & CGC Vicinity)',
      'Phase 1 to 11',
      'Aerocity & IT City',
      'Sector 70 (Mattaur)',
      'Sector 71',
    ],
  },
  {
    city: 'Phagwara',
    isMajorStudentHub: true,
    localities: [
      'LPU Main Highway Corridor',
      'Law Gate (LPU Vicinity)',
      'Maheru Village Corridor',
      'Model Town Phagwara',
      'Sugar Mill & GT Road',
      'Hoshiarpur Road',
    ],
  },
  {
    city: 'Hoshiarpur',
    isMajorStudentHub: false,
    localities: [
      'Chandigarh Road',
      'Model Town',
      'Dasuya Road',
      'Civil Lines',
      'Una Road',
    ],
  },
  {
    city: 'Moga',
    isMajorStudentHub: false,
    localities: [
      'GT Road Moga',
      'Nature Park Vicinity',
      'Baghapurana Road',
      'Civil Lines',
    ],
  },
  {
    city: 'Khanna',
    isMajorStudentHub: false,
    localities: [
      'GT Road Corridor',
      'Guru Nanak College Road',
      'Malerkotla Road',
      'Amloh Road',
    ],
  },
  {
    city: 'Rajpura',
    isMajorStudentHub: true,
    localities: [
      'Chitkara University Vicinity (Jhansla)',
      'GT Road Rajpura',
      'Patiala Road',
      'Focal Point',
    ],
  },
  {
    city: 'Firozpur',
    isMajorStudentHub: false,
    localities: [
      'Cantonment Road',
      'Mall Road',
      'SBS University Corridor',
      'City Area',
    ],
  },
  {
    city: 'Pathankot',
    isMajorStudentHub: false,
    localities: [
      'Dalhousie Road',
      'Mission Road',
      'Model Town',
      'Patel Chowk',
    ],
  },
  {
    city: 'Rupnagar (Ropar)',
    isMajorStudentHub: true,
    localities: [
      'IIT Ropar Campus Vicinity',
      'Bela Road',
      'Giani Zail Singh Nagar',
      'Nangal Road',
    ],
  },
  {
    city: 'Fatehgarh Sahib',
    isMajorStudentHub: true,
    localities: [
      'BBSBEC Engineering Vicinity',
      'Sirhind GT Road',
      'Mandi Gobindgarh Steel Corridor',
    ],
  },
  {
    city: 'Kapurthala',
    isMajorStudentHub: false,
    localities: [
      'PTU Main Campus (Jalandhar-Kapurthala Rd)',
      'Mall Road',
      'Sultanpur Lodhi Road',
    ],
  },
  {
    city: 'Sangrur',
    isMajorStudentHub: false,
    localities: [
      'SLIET Longowal Corridor',
      'Dhuri Road',
      'Patiala Road',
    ],
  },
  {
    city: 'Barnala',
    isMajorStudentHub: false,
    localities: [
      'Handiaya Road',
      'Kachehri Road',
      'Dhanaula Road',
    ],
  },
  {
    city: 'Abohar',
    isMajorStudentHub: false,
    localities: [
      'Fazilka Road',
      'Circular Road',
      'College Road',
    ],
  },
  {
    city: 'Malerkotla',
    isMajorStudentHub: false,
    localities: [
      'Ludhiana Bypass',
      'Nawab Sher Mohammad Khan Chowk',
      'Rauni Road',
    ],
  },
];

export const ALL_PUNJAB_CITIES = PUNJAB_CITIES_DATA.map((c) => c.city);

export function getLocalitiesForCity(cityName: string): string[] {
  const found = PUNJAB_CITIES_DATA.find(
    (c) => c.city.toLowerCase() === (cityName || '').trim().toLowerCase()
  );
  if (found) {
    return [...found.localities, 'Other / Custom Locality'];
  }
  return [
    'Campus Vicinity',
    'Main Market Area',
    'Model Town',
    'Civil Lines',
    'Other / Custom Locality',
  ];
}
