/**
 * SolarCalculationService
 * Calculates solar system sizing, generation estimates, and performance metrics
 */

import { Injectable } from '@nitrostack/core';

export interface SolarCalculationInput {
  roofAreaSqm: number; // Roof area in square meters
  dailyIrradiance: number; // kWh/m²/day
  systemEfficiency?: number; // 0-1, default 0.75
  panelEfficiency?: number; // 0-1, default 0.18
}

export interface SolarCalculationResult {
  roofAreaSqm: number;
  usableAreaSqm: number; // 80% of roof area (accounting for obstructions)
  recommendedSystemSizeKw: number;
  numberOfPanels: number; // Assuming 400W panels
  estimatedAnnualGenerationKwh: number;
  estimatedMonthlyGenerationKwh: number;
  performanceRatio: number; // 0-1
  co2OffsetPerYear: number; // kg CO2
}

@Injectable()
export class SolarCalculationService {
  /**
   * Calculate solar system sizing and generation estimates
   */
  calculateSolarPotential(
    input: SolarCalculationInput
  ): SolarCalculationResult {
    const systemEfficiency = input.systemEfficiency ?? 0.75;
    const panelEfficiency = input.panelEfficiency ?? 0.18;

    // Usable roof area (accounting for obstructions, orientation, etc.)
    const usableAreaSqm = input.roofAreaSqm * 0.8;

    // System size calculation: Area × Panel Efficiency × System Efficiency
    const systemSizeKw =
      (usableAreaSqm * panelEfficiency * systemEfficiency) / 1000;

    // Number of 400W panels needed
    const numberOfPanels = Math.ceil((systemSizeKw * 1000) / 400);

    // Annual generation: System Size × Daily Irradiance × 365 days
    const estimatedAnnualGenerationKwh =
      systemSizeKw * input.dailyIrradiance * 365;

    // Monthly average
    const estimatedMonthlyGenerationKwh =
      estimatedAnnualGenerationKwh / 12;

    // Performance ratio (typical 75-85%)
    const performanceRatio = systemEfficiency;

    // CO2 offset: 1 kWh = ~0.73 kg CO2 (India grid average)
    const co2OffsetPerYear = estimatedAnnualGenerationKwh * 0.73;

    return {
      roofAreaSqm: input.roofAreaSqm,
      usableAreaSqm: Math.round(usableAreaSqm * 100) / 100,
      recommendedSystemSizeKw: Math.round(systemSizeKw * 100) / 100,
      numberOfPanels,
      estimatedAnnualGenerationKwh:
        Math.round(estimatedAnnualGenerationKwh * 100) / 100,
      estimatedMonthlyGenerationKwh:
        Math.round(estimatedMonthlyGenerationKwh * 100) / 100,
      performanceRatio: Math.round(performanceRatio * 10000) / 10000,
      co2OffsetPerYear: Math.round(co2OffsetPerYear * 100) / 100,
    };
  }
}
