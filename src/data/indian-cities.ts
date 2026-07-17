/**
 * Mock Indian cities database with coordinates and solar irradiance baseline
 */

export interface IndianCity {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  avgSolarIrradiance: number; // kWh/m²/day (annual average)
}

export const INDIAN_CITIES: IndianCity[] = [
  {
    name: 'Kochi',
    state: 'Kerala',
    latitude: 9.9312,
    longitude: 76.2673,
    avgSolarIrradiance: 4.8,
  },
  {
    name: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    avgSolarIrradiance: 5.2,
  },
  {
    name: 'Delhi',
    state: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    avgSolarIrradiance: 5.5,
  },
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    avgSolarIrradiance: 5.1,
  },
  {
    name: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    avgSolarIrradiance: 5.3,
  },
  {
    name: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.3850,
    longitude: 78.4867,
    avgSolarIrradiance: 5.4,
  },
  {
    name: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
    avgSolarIrradiance: 5.3,
  },
  {
    name: 'Jaipur',
    state: 'Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    avgSolarIrradiance: 5.6,
  },
];

/**
 * Find a city by name (case-insensitive)
 */
export function findCityByName(name: string): IndianCity | undefined {
  return INDIAN_CITIES.find(
    (city) => city.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Find cities by state (case-insensitive)
 */
export function findCitiesByState(state: string): IndianCity[] {
  return INDIAN_CITIES.filter(
    (city) => city.state.toLowerCase() === state.toLowerCase()
  );
}
