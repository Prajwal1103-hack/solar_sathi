/**
 * LocationService
 * Handles geocoding and location lookup for Indian cities
 */

import { Injectable } from '@nitrostack/core';
import { findCityByName, IndianCity } from '../data/indian-cities.js';

export interface LocationResult {
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  found: boolean;
}

@Injectable()
export class LocationService {
  /**
   * Parse a location string and return coordinates
   * Supports formats like "Kochi, Kerala" or just "Kochi"
   */
  async getLocation(locationString: string): Promise<LocationResult> {
    const parts = locationString.split(',').map((p) => p.trim());
    const cityName = parts[0];

    const city = findCityByName(cityName);

    if (!city) {
      return {
        city: cityName,
        state: parts[1] || 'Unknown',
        latitude: 0,
        longitude: 0,
        found: false,
      };
    }

    return {
      city: city.name,
      state: city.state,
      latitude: city.latitude,
      longitude: city.longitude,
      found: true,
    };
  }

  /**
   * Get city details by name
   */
  getCityDetails(cityName: string): IndianCity | undefined {
    return findCityByName(cityName);
  }
}
