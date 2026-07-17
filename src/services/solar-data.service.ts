/**
 * SolarDataService
 * Fetches solar irradiance and weather data (mock Open-Meteo integration)
 */

import { Injectable } from '@nitrostack/core';
import { findCityByName } from '../data/indian-cities.js';

export interface SolarData {
  latitude: number;
  longitude: number;
  dailyIrradiance: number; // kWh/m²/day
  monthlyAverage: number; // kWh/m²/day
  temperature: number; // °C
  cloudCover: number; // 0-100%
  weatherCondition: string;
}

@Injectable()
export class SolarDataService {
  /**
   * Get solar irradiance data for a location
   * Mock implementation based on city baseline + seasonal variation
   */
  async getSolarData(
    latitude: number,
    longitude: number,
    cityName?: string
  ): Promise<SolarData> {
    // Find baseline irradiance from city data
    let baselineIrradiance = 5.0; // Default fallback

    if (cityName) {
      const city = findCityByName(cityName);
      if (city) {
        baselineIrradiance = city.avgSolarIrradiance;
      }
    }

    // Mock seasonal variation (±15% from baseline)
    const seasonalFactor = 0.85 + Math.random() * 0.3;
    const dailyIrradiance = baselineIrradiance * seasonalFactor;

    // Mock weather conditions
    const weatherConditions = [
      'Clear',
      'Partly Cloudy',
      'Mostly Cloudy',
      'Overcast',
    ];
    const weatherCondition =
      weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    return {
      latitude,
      longitude,
      dailyIrradiance: Math.round(dailyIrradiance * 100) / 100,
      monthlyAverage: Math.round(baselineIrradiance * 100) / 100,
      temperature: 25 + Math.random() * 10, // 25-35°C
      cloudCover: Math.floor(Math.random() * 60), // 0-60%
      weatherCondition,
    };
  }
}
