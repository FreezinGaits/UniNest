export const PCTE_LAT = 30.8984;
export const PCTE_LNG = 75.8564;

export interface LocationCity {
  name: string;
  localities: string[];
}

export interface LocationState {
  name: string;
  code: string;
  cities: LocationCity[];
}

export interface CollegeLandmark {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  type: 'COLLEGE' | 'LANDMARK';
  address: string;
}

export const STATES_DATA: LocationState[] = [
  {
    name: 'Punjab',
    code: 'PB',
    cities: [
      {
        name: 'Ludhiana',
        localities: [
          'Model Town',
          'Sarabha Nagar',
          'Rajguru Nagar',
          'Ferozepur Road',
          'BRS Nagar',
          'Civil Lines',
          'Pakhowal Road',
        ],
      },
      {
        name: 'Chandigarh',
        localities: ['Sector 15', 'Sector 22', 'Sector 34', 'Sector 36', 'Sector 44'],
      },
      {
        name: 'Jalandhar',
        localities: ['Model Town', 'Urban Estate Phase 1', 'Cantt Road', 'Rama Mandi'],
      },
      {
        name: 'Amritsar',
        localities: ['Ranjit Avenue', 'Mall Road', 'GT Road', 'Model Town'],
      },
      {
        name: 'Patiala',
        localities: ['Urban Estate', 'Model Town', 'Leela Bhawan', 'Passey Road'],
      },
    ],
  },
  {
    name: 'Chandigarh',
    code: 'CH',
    cities: [
      {
        name: 'Chandigarh',
        localities: ['Sector 15', 'Sector 22', 'Sector 34', 'Sector 36', 'Sector 44'],
      },
    ],
  },
  {
    name: 'Haryana',
    code: 'HR',
    cities: [
      { name: 'Gurugram', localities: ['DLF Phase 3', 'Sector 14', 'Sector 43', 'Sohna Road'] },
      { name: 'Faridabad', localities: ['Sector 15', 'NIT', 'Sector 16'] },
      { name: 'Ambala', localities: ['Ambala Cantt', 'Model Town'] },
    ],
  },
  {
    name: 'Delhi',
    code: 'DL',
    cities: [
      { name: 'North Delhi', localities: ['Hudson Lane', 'Kamla Nagar', 'Vijay Nagar', 'GTB Nagar'] },
      { name: 'South Delhi', localities: ['Satya Niketan', 'Green Park', 'Hauz Khas', 'Lajpat Nagar'] },
    ],
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    cities: [
      { name: 'Jaipur', localities: ['Malviya Nagar', 'Raja Park', 'Vaishali Nagar'] },
      { name: 'Kota', localities: ['Vigyan Nagar', 'Talwandi', 'Mahaveer Nagar'] },
    ],
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    cities: [
      { name: 'Noida', localities: ['Sector 62', 'Sector 125', 'Knowledge Park Greater Noida'] },
      { name: 'Lucknow', localities: ['Hazratganj', 'Gomti Nagar', 'Aliganj'] },
    ],
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    cities: [
      { name: 'Dehradun', localities: ['Rajpur Road', 'Clement Town', 'Prem Nagar'] },
    ],
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    cities: [
      { name: 'Shimla', localities: ['Summer Hill', 'Mall Road', 'Sanjauli'] },
      { name: 'Solan', localities: ['Solan Bypass', 'Shoolini Campus Area'] },
    ],
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    cities: [
      { name: 'Pune', localities: ['Viman Nagar', 'Kothrud', 'Hinjewadi', 'Baner'] },
      { name: 'Mumbai', localities: ['Andheri West', 'Vile Parle', 'Powai'] },
    ],
  },
  {
    name: 'Karnataka',
    code: 'KA',
    cities: [
      { name: 'Bengaluru', localities: ['Koramangala', 'HSR Layout', 'Indiranagar', 'Electronic City'] },
    ],
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    cities: [
      { name: 'Chennai', localities: ['Adyar', 'Velachery', 'Anna Nagar'] },
    ],
  },
  {
    name: 'Telangana',
    code: 'TS',
    cities: [
      { name: 'Hyderabad', localities: ['Gachibowli', 'Madhapur', 'HITECH City', 'Kukatpally'] },
    ],
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    cities: [
      { name: 'Ahmedabad', localities: ['Navrangpura', 'Satellite', 'SG Highway'] },
    ],
  },
  {
    name: 'West Bengal',
    code: 'WB',
    cities: [
      { name: 'Kolkata', localities: ['Salt Lake', 'New Town', 'Jadavpur'] },
    ],
  },
  {
    name: 'Kerala',
    code: 'KL',
    cities: [
      { name: 'Kochi', localities: ['Kakkanad', 'Edappally', 'Kaloor'] },
    ],
  },
];

export const COLLEGES_DATA: CollegeLandmark[] = [
  {
    id: 'pcte-ludhiana',
    name: 'PCTE Institute',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.8984,
    longitude: 75.8564,
    type: 'COLLEGE',
    address: 'Ferozepur Road, Baddowal, Ludhiana, Punjab 141012',
  },
  {
    id: 'gndec-ludhiana',
    name: 'Guru Nanak Dev Engineering College',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.8606,
    longitude: 75.8596,
    type: 'COLLEGE',
    address: 'Gill Road, Ludhiana, Punjab 141006',
  },
  {
    id: 'pau-ludhiana',
    name: 'Punjab Agricultural University',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.9010,
    longitude: 75.8070,
    type: 'COLLEGE',
    address: 'Ferozepur Road, Ludhiana, Punjab 141004',
  },
  {
    id: 'khalsa-women-ludhiana',
    name: 'Khalsa College for Women',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.9030,
    longitude: 75.8360,
    type: 'COLLEGE',
    address: 'Rani Jhansi Road, Civil Lines, Ludhiana, Punjab 141001',
  },
  {
    id: 'cmc-ludhiana',
    name: 'Christian Medical College Area',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.9120,
    longitude: 75.8620,
    type: 'COLLEGE',
    address: 'Brown Road, Civil Lines, Ludhiana, Punjab 141008',
  },
  {
    id: 'model-town-market',
    name: 'Model Town Main Market',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.8900,
    longitude: 75.8400,
    type: 'LANDMARK',
    address: 'Model Town, Ludhiana, Punjab 141002',
  },
  {
    id: 'sarabha-nagar-market',
    name: 'Sarabha Nagar Kipper Market',
    city: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.8950,
    longitude: 75.8250,
    type: 'LANDMARK',
    address: 'Kippss Market, Sarabha Nagar, Ludhiana, Punjab 141001',
  },
];

// Dynamic Haversine distance calculator between coordinates (in km)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function estimateCommuteTime(distanceKm: number, destinationName?: string): string {
  const destName = destinationName ? destinationName.split(' ')[0] : 'Campus';
  if (distanceKm <= 0.5) return `${Math.round(distanceKm * 1000)}m walk (${Math.max(2, Math.round(distanceKm * 10))} mins to ${destName})`;
  if (distanceKm <= 1.5) return `${Math.round(distanceKm * 12)} mins walk / 3 mins auto to ${destName}`;
  if (distanceKm <= 3.5) return `${Math.round(distanceKm * 3)} mins auto / 10 mins e-rickshaw to ${destName}`;
  return `${Math.round(distanceKm * 4)} mins bus / auto to ${destName}`;
}
