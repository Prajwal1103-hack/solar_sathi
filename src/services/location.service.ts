/**
 * LocationService
 * Handles geocoding and location lookup for Indian cities via Nominatim API.
 * Falls back to the static city table when Nominatim is unavailable.
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

/** Shape of a single Nominatim search result. */
interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

/** Nominatim endpoint. Uses the public OSM instance (free, no key required). */
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/** Timeout for Nominatim requests in milliseconds. */
const REQUEST_TIMEOUT_MS = 5000;

/** Default values for missing fields. */
const DEFAULT_STATE = 'Unknown';
const DEFAULT_COORDINATE = 0;

/**
 * Build a User-Agent that complies with Nominatim's usage policy.
 * https://operations.osmfoundation.org/policies/nominatim/
 */
const USER_AGENT = 'SolarSathi/1.0 (solar-sathi MCP server; educational/hackathon use)';

@Injectable()
export class LocationService {
  /**
   * Parse a location string and return coordinates.
   * Supports formats like "Kochi, Kerala" or just "Kochi".
   *
   * Strategy:
   * 1. Try Nominatim geocoding API (live, accurate, covers any Indian city).
   * 2. On failure, fall back to the local static city table.
   * 3. If neither succeeds, return found: false without throwing.
   */
  async getLocation(locationString: string): Promise<LocationResult> {
    const parts = locationString.split(',').map((p) => p.trim());
    const cityName = parts[0];
    const stateHint = parts[1] ?? '';

    // Attempt Nominatim first.
    try {
      const nominatimResult = await this.queryNominatim(locationString, cityName);
      if (nominatimResult) {
        return nominatimResult;
      }
    } catch (error) {
      console.warn(`Nominatim geocoding failed for "${locationString}". Falling back to local data. Error:`, error);
    }

    // Fallback: local static city table.
    const city = findCityByName(cityName);
    if (city) {
      return {
        city: city.name,
        state: city.state,
        latitude: city.latitude,
        longitude: city.longitude,
        found: true,
      };
    }

    // Neither source found the location.
    return {
      city: cityName,
      state: stateHint || DEFAULT_STATE,
      latitude: DEFAULT_COORDINATE,
      longitude: DEFAULT_COORDINATE,
      found: false,
    };
  }

  /**
   * Get city details from the local static table by name.
   * This method is unchanged and keeps its original public contract.
   */
  getCityDetails(cityName: string): IndianCity | undefined {
    return findCityByName(cityName);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Query the Nominatim geocoding API.
   * Returns a LocationResult on success, null on no results.
   * Throws on network/timeout errors (caller handles fallback).
   */
  private async queryNominatim(locationString: string, cityName: string): Promise<LocationResult | null> {
    // Append "India" to bias results toward Indian cities.
    const query = locationString.toLowerCase().includes('india')
      ? locationString
      : `${locationString}, India`;

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'in',
      addressdetails: '1',
    });

    const url = `${NOMINATIM_BASE_URL}?${params.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`Nominatim responded with HTTP ${response.status}`);
    }

    const results: NominatimResult[] = await response.json() as NominatimResult[];

    if (!results || results.length === 0) {
      return null;
    }

    const hit = results[0];
    const lat = parseFloat(hit.lat);
    const lon = parseFloat(hit.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return null;
    }

    // Extract city and state from the address object when available.
    const city =
      hit.address?.city ??
      hit.address?.town ??
      hit.address?.village ??
      cityName;

    const state = hit.address?.state ?? DEFAULT_STATE;

    return {
      city,
      state,
      latitude: lat,
      longitude: lon,
      found: true,
    };
  }
}
