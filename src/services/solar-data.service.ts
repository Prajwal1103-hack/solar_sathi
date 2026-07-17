/**
 * SolarDataService
 * Fetches real solar irradiance and weather data from the Open-Meteo API.
 * Falls back to local city baselines if the API is unavailable.
 *
 * Open-Meteo endpoint used:
 *   GET https://api.open-meteo.com/v1/forecast
 *   Parameters:
 *     latitude, longitude, timezone=auto, forecast_days=1
 *     daily=shortwave_radiation_sum
 *     hourly=temperature_2m,cloudcover
 *
 * Unit mapping:
 *   shortwave_radiation_sum → MJ/m²/day
 *     Converted to kWh/m²/day by dividing by 3.6 (1 kWh = 3.6 MJ).
 *     This represents daily Global Horizontal Irradiance (GHI), used as
 *     dailyIrradiance and monthlyAverage (same value; monthlyAverage is
 *     preserved for backward compatibility per the existing contract note in
 *     API_CONTRACTS.md).
 *   temperature_2m → °C (midday hour average)
 *   cloudcover     → % (midday hour average)
 */

import { Injectable } from '@nitrostack/core';
import { findCityByName } from '../data/indian-cities.js';

export interface SolarData {
  latitude: number;
  longitude: number;
  dailyIrradiance: number;  // kWh/m²/day
  monthlyAverage: number;   // kWh/m²/day (same as dailyIrradiance per contract)
  temperature: number;      // °C
  cloudCover: number;       // 0-100%
  weatherCondition: string;
}

// ---------------------------------------------------------------------------
// Open-Meteo response types (only fields we consume)
// ---------------------------------------------------------------------------

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  daily?: {
    shortwave_radiation_sum?: number[];
  };
  hourly?: {
    temperature_2m?: number[];
    cloudcover?: number[];
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 8000;
const MJ_TO_KWH = 1 / 3.6; // Multiply MJ/m² by this to get kWh/m²

// Default and fallback values for weather metrics
const DEFAULT_TEMPERATURE_C = 30;
const MIDDAY_FALLBACK_TEMP_C = 28;
const DEFAULT_CLOUD_COVER_PCT = 30;
const DEFAULT_IRRADIANCE_KWH_M2_DAY = 5.0;

// Midday hour range for weather averaging (10:00 to 14:00)
const MIDDAY_START_HOUR = 10;
const MIDDAY_END_HOUR = 15; // slice is end-exclusive, so this gets indices 10, 11, 12, 13, 14

/**
 * Derive a human-readable weather condition from cloud cover percentage.
 * Mirrors the labels used in the original mock implementation.
 */
function cloudCoverToCondition(cloudCoverPct: number): string {
  if (cloudCoverPct < 20) return 'Clear';
  if (cloudCoverPct < 50) return 'Partly Cloudy';
  if (cloudCoverPct < 75) return 'Mostly Cloudy';
  return 'Overcast';
}

/**
 * Compute the average of an array of numbers, ignoring null/undefined values.
 * Returns the fallback value if the array is empty or all values are invalid.
 */
function safeAverage(values: (number | null | undefined)[], fallback: number): number {
  const valid = values.filter((v): v is number => typeof v === 'number' && isFinite(v));
  if (valid.length === 0) return fallback;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

@Injectable()
export class SolarDataService {
  /**
   * Get solar irradiance data for a location.
   *
   * Strategy:
   * 1. Fetch today's data from Open-Meteo (live, coordinate-based).
   * 2. On any failure, fall back to local city baseline data with a
   *    deterministic (non-random) seasonal estimate.
   *
   * The returned object always matches the SolarData interface exactly.
   */
  async getSolarData(
    latitude: number,
    longitude: number,
    cityName?: string
  ): Promise<SolarData> {
    try {
      const data = await this.fetchOpenMeteo(latitude, longitude);
      return data;
    } catch (error) {
      console.warn(
        `Open-Meteo API query failed for lat=${latitude}, lon=${longitude}. Falling back to local data. Error:`,
        error
      );
      return this.buildFallback(latitude, longitude, cityName);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Call the Open-Meteo forecast API and map the response to SolarData.
   * Throws on network errors, timeouts, non-200 status codes, or missing data.
   */
  private async fetchOpenMeteo(
    latitude: number,
    longitude: number
  ): Promise<SolarData> {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily: 'shortwave_radiation_sum',
      hourly: 'temperature_2m,cloudcover',
      timezone: 'auto',
      forecast_days: '1',
    });

    const url = `${OPEN_METEO_BASE_URL}?${params.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`Open-Meteo responded with HTTP ${response.status}`);
    }

    const body = await response.json() as OpenMeteoResponse;

    // ── Daily irradiance ──────────────────────────────────────────────────────
    // shortwave_radiation_sum is in MJ/m²/day; convert to kWh/m²/day.
    const rawRadiation = body.daily?.shortwave_radiation_sum?.[0];
    if (rawRadiation == null || !isFinite(rawRadiation)) {
      throw new Error('Open-Meteo response missing shortwave_radiation_sum');
    }
    const dailyIrradiance = Math.round(rawRadiation * MJ_TO_KWH * 100) / 100;

    // ── Temperature: midday average (hours 10–14) ─────────────────────────────
    const allTemps = body.hourly?.temperature_2m ?? [];
    const middayTemps = allTemps.slice(MIDDAY_START_HOUR, MIDDAY_END_HOUR);
    const temperature = Math.round(safeAverage(middayTemps, MIDDAY_FALLBACK_TEMP_C) * 10) / 10;

    // ── Cloud cover: midday average (hours 10–14) ─────────────────────────────
    const allCloud = body.hourly?.cloudcover ?? [];
    const middayCloud = allCloud.slice(MIDDAY_START_HOUR, MIDDAY_END_HOUR);
    const cloudCover = Math.round(safeAverage(middayCloud, DEFAULT_CLOUD_COVER_PCT));

    return {
      latitude,
      longitude,
      dailyIrradiance,
      monthlyAverage: dailyIrradiance, // Contract: same field, same value.
      temperature,
      cloudCover,
      weatherCondition: cloudCoverToCondition(cloudCover),
    };
  }

  /**
   * Build a deterministic fallback result using the local city baseline table.
   * Used when Open-Meteo is unavailable. Does NOT use Math.random().
   */
  private buildFallback(
    latitude: number,
    longitude: number,
    cityName?: string
  ): SolarData {
    let baselineIrradiance = DEFAULT_IRRADIANCE_KWH_M2_DAY;

    if (cityName) {
      const city = findCityByName(cityName);
      if (city) {
        baselineIrradiance = city.avgSolarIrradiance;
      }
    }

    return {
      latitude,
      longitude,
      dailyIrradiance: baselineIrradiance,
      monthlyAverage: baselineIrradiance,
      temperature: DEFAULT_TEMPERATURE_C,
      cloudCover: DEFAULT_CLOUD_COVER_PCT,
      weatherCondition: cloudCoverToCondition(DEFAULT_CLOUD_COVER_PCT),
    };
  }
}
