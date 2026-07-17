/**
 * SubsidyService
 * Calculates PM Surya Ghar subsidy and financial metrics for Indian homeowners
 */

import { Injectable } from '@nitrostack/core';

export interface SubsidyCalculationInput {
  systemSizeKw: number;
  annualGenerationKwh: number;
  roofAreaSqm: number;
}

export interface SubsidyCalculationResult {
  systemSizeKw: number;
  installationCostInr: number; // ₹ per kW
  totalInstallationCostInr: number;
  subsidyAmountInr: number; // PM Surya Ghar subsidy
  netCostAfterSubsidyInr: number;
  annualElectricityBillSavingsInr: number;
  paybackPeriodYears: number;
  annualCo2ReductionKg: number;
  recommendation: string;
}

@Injectable()
export class SubsidyService {
  // PM Surya Ghar subsidy structure (2024)
  private readonly SUBSIDY_TIERS = [
    { maxKw: 3, subsidyPercentage: 0.4 }, // 40% for ≤3 kW
    { maxKw: 10, subsidyPercentage: 0.25 }, // 25% for 3-10 kW
    { maxKw: Infinity, subsidyPercentage: 0.2 }, // 20% for >10 kW
  ];

  private readonly INSTALLATION_COST_PER_KW = 120000; // ₹ per kW (2024 average)
  private readonly ELECTRICITY_RATE_PER_KWH = 8; // ₹ per kWh (India average)

  /**
   * Calculate subsidy and financial metrics
   */
  calculateSubsidy(
    input: SubsidyCalculationInput
  ): SubsidyCalculationResult {
    const totalInstallationCostInr =
      input.systemSizeKw * this.INSTALLATION_COST_PER_KW;

    // Determine subsidy percentage based on system size
    const subsidyTier = this.SUBSIDY_TIERS.find(
      (tier) => input.systemSizeKw <= tier.maxKw
    );
    const subsidyPercentage = subsidyTier?.subsidyPercentage ?? 0.2;
    const subsidyAmountInr = totalInstallationCostInr * subsidyPercentage;

    const netCostAfterSubsidyInr =
      totalInstallationCostInr - subsidyAmountInr;

    // Annual electricity bill savings
    const annualElectricityBillSavingsInr =
      input.annualGenerationKwh * this.ELECTRICITY_RATE_PER_KWH;

    // Payback period (years)
    const paybackPeriodYears =
      netCostAfterSubsidyInr / annualElectricityBillSavingsInr;

    // Annual CO2 reduction (1 kWh = 0.73 kg CO2)
    const annualCo2ReductionKg = input.annualGenerationKwh * 0.73;

    // Generate recommendation
    let recommendation = '';
    if (paybackPeriodYears <= 5) {
      recommendation =
        'Excellent investment! Payback within 5 years. Highly recommended.';
    } else if (paybackPeriodYears <= 7) {
      recommendation =
        'Good investment. Payback within 7 years. Recommended for long-term savings.';
    } else if (paybackPeriodYears <= 10) {
      recommendation =
        'Moderate investment. Payback within 10 years. Consider if you plan to stay long-term.';
    } else {
      recommendation =
        'Long payback period. Consider increasing roof area or waiting for cost reduction.';
    }

    return {
      systemSizeKw: input.systemSizeKw,
      installationCostInr: this.INSTALLATION_COST_PER_KW,
      totalInstallationCostInr: Math.round(totalInstallationCostInr),
      subsidyAmountInr: Math.round(subsidyAmountInr),
      netCostAfterSubsidyInr: Math.round(netCostAfterSubsidyInr),
      annualElectricityBillSavingsInr: Math.round(
        annualElectricityBillSavingsInr
      ),
      paybackPeriodYears: Math.round(paybackPeriodYears * 10) / 10,
      annualCo2ReductionKg: Math.round(annualCo2ReductionKg),
      recommendation,
    };
  }
}
