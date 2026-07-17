import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import subsidyTable from "../../data/pm_surya_ghar_subsidy_table.json" assert { type: "json" };
import costDefaults from "../../data/installation_cost_defaults.json" assert { type: "json" };

// ============ INPUT SCHEMAS ============

const GetSolarIrradianceSchema = z.object({
  latitude: z.number().min(-90).max(90).describe("Latitude in decimal degrees"),
  longitude: z.number().min(-180).max(180).describe("Longitude in decimal degrees"),
});

const CalculateSolarCapacitySchema = z.object({
  monthly_bill: z.number().positive().describe("Monthly electricity bill in INR"),
  tariff_per_kwh: z.number().positive().describe("Electricity tariff in INR/kWh"),
  roof_area_sqft: z.number().positive().describe("Usable roof area in square feet"),
  monthly_units: z.number().positive().optional().describe("Optional: monthly consumption in kWh"),
});

const EstimateInstallationCostSchema = z.object({
  capacity_kw: z.number().positive().describe("Solar system capacity in kW"),
  cost_per_kw: z.number().positive().optional().describe("Cost per kW in INR (default: ₹62,500)"),
});

const CalculateSubsidySchema = z.object({
  capacity_kw: z.number().positive().describe("Solar system capacity in kW"),
});

const CalculateROISchema = z.object({
  installation_cost: z.number().positive().describe("Total installation cost in INR"),
  subsidy: z.number().nonnegative().describe("Subsidy amount in INR"),
  monthly_bill: z.number().positive().describe("Current monthly electricity bill in INR"),
});

const CalculateEnvironmentalImpactSchema = z.object({
  capacity_kw: z.number().positive().describe("Solar system capacity in kW"),
});

// ============ TOOL IMPLEMENTATIONS ============

export async function getSolarIrradiance(
  latitude: number,
  longitude: number
): Promise<{ daily_irradiance_kwh_m2: number; location: string; note: string }> {
  try {
    // Open-Meteo API call (free, no auth required)
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2023-01-01&end_date=2023-12-31&daily=shortwave_radiation_sum&timezone=auto`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      daily: { shortwave_radiation_sum: number[] };
    };

    const radiationValues = data.daily.shortwave_radiation_sum;
    const avgRadiation = radiationValues.reduce((a, b) => a + b, 0) / radiationValues.length;
    // Convert from J/m² to kWh/m² (divide by 3.6M)
    const avgIrradiance = avgRadiation / 3_600_000;

    return {
      daily_irradiance_kwh_m2: Math.round(avgIrradiance * 100) / 100,
      location: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
      note: "Based on 2023 historical data from Open-Meteo",
    };
  } catch (error) {
    throw new Error(`Failed to fetch solar irradiance: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function calculateSolarCapacity(
  monthly_bill: number,
  tariff_per_kwh: number,
  roof_area_sqft: number,
  monthly_units?: number
): {
  capacity_kw: number;
  required_roof_area_sqft: number;
  roof_limited: boolean;
  monthly_consumption_kwh: number;
} {
  // Derive monthly units if not provided
  const consumption = monthly_units || monthly_bill / tariff_per_kwh;

  if (consumption <= 0) {
    throw new Error("Monthly consumption must be positive");
  }

  // Recommended capacity: consumption / 120 (assuming 120 units/kW/year)
  let capacity = consumption / 120;

  // Check roof suitability: ~100 sqft per kW
  const requiredArea = capacity * 100;
  const roofLimited = requiredArea > roof_area_sqft;

  if (roofLimited) {
    capacity = roof_area_sqft / 100;
  }

  return {
    capacity_kw: Math.round(capacity * 100) / 100,
    required_roof_area_sqft: Math.round(requiredArea * 100) / 100,
    roof_limited: roofLimited,
    monthly_consumption_kwh: Math.round(consumption * 100) / 100,
  };
}

export function estimateInstallationCost(
  capacity_kw: number,
  cost_per_kw?: number
): {
  capacity_kw: number;
  cost_per_kw: number;
  total_cost_inr: number;
  cost_range_inr: { min: number; max: number };
} {
  const costDefault = cost_per_kw || costDefaults.cost_per_kw.avg_inr;

  if (costDefault <= 0) {
    throw new Error("Cost per kW must be positive");
  }

  const totalCost = capacity_kw * costDefault;
  const minCost = capacity_kw * costDefaults.cost_per_kw.min_inr;
  const maxCost = capacity_kw * costDefaults.cost_per_kw.max_inr;

  return {
    capacity_kw,
    cost_per_kw: costDefault,
    total_cost_inr: Math.round(totalCost),
    cost_range_inr: {
      min: Math.round(minCost),
      max: Math.round(maxCost),
    },
  };
}

export function calculateSubsidy(capacity_kw: number): {
  capacity_kw: number;
  subsidy_per_kw: number;
  total_subsidy_inr: number;
  tier_description: string;
} {
  const tier = subsidyTable.subsidy_table.find(
    (t) => capacity_kw >= t.capacity_kw_min && capacity_kw <= t.capacity_kw_max
  );

  if (!tier) {
    throw new Error(`No subsidy tier found for capacity ${capacity_kw} kW`);
  }

  const totalSubsidy = capacity_kw * tier.subsidy_per_kw;

  return {
    capacity_kw,
    subsidy_per_kw: tier.subsidy_per_kw,
    total_subsidy_inr: Math.round(totalSubsidy),
    tier_description: tier.description,
  };
}

export function calculateROI(
  installation_cost: number,
  subsidy: number,
  monthly_bill: number
): {
  final_cost_after_subsidy: number;
  monthly_savings: number;
  annual_savings: number;
  payback_period_years: number;
  lifetime_savings_25yr: number;
  roi_percentage: number;
} {
  if (monthly_bill <= 0) {
    throw new Error("Monthly bill must be positive");
  }

  const finalCost = installation_cost - subsidy;
  const monthlySavings = monthly_bill;
  const annualSavings = monthlySavings * 12;
  const paybackYears = finalCost / annualSavings;
  const lifetimeSavings = annualSavings * 25;
  const roi = ((lifetimeSavings - finalCost) / finalCost) * 100;

  return {
    final_cost_after_subsidy: Math.round(finalCost),
    monthly_savings: Math.round(monthlySavings),
    annual_savings: Math.round(annualSavings),
    payback_period_years: Math.round(paybackYears * 100) / 100,
    lifetime_savings_25yr: Math.round(lifetimeSavings),
    roi_percentage: Math.round(roi * 100) / 100,
  };
}

export function calculateEnvironmentalImpact(capacity_kw: number): {
  capacity_kw: number;
  annual_energy_kwh: number;
  co2_reduction_kg: number;
  co2_reduction_tonnes: number;
  trees_saved: number;
} {
  const annualEnergy = capacity_kw * 120 * 12; // 120 units/kW/year
  const co2ReductionKg = annualEnergy * 0.82; // kg CO2 per kWh
  const co2ReductionTonnes = co2ReductionKg / 1000;
  const treesSaved = Math.round(co2ReductionKg / 21); // 21 kg CO2 per tree per year

  return {
    capacity_kw,
    annual_energy_kwh: Math.round(annualEnergy),
    co2_reduction_kg: Math.round(co2ReductionKg),
    co2_reduction_tonnes: Math.round(co2ReductionTonnes * 100) / 100,
    trees_saved: treesSaved,
  };
}

// ============ TOOL DEFINITIONS ============

export const solarTools: Tool[] = [
  {
    name: "get_solar_irradiance",
    description:
      "Fetch solar irradiance data for a geographic location using Open-Meteo API. Returns average daily solar radiation in kWh/m².",
    inputSchema: {
      type: "object",
      properties: {
        latitude: {
          type: "number",
          description: "Latitude in decimal degrees (-90 to 90)",
        },
        longitude: {
          type: "number",
          description: "Longitude in decimal degrees (-180 to 180)",
        },
      },
      required: ["latitude", "longitude"],
    },
  },
  {
    name: "calculate_solar_capacity",
    description:
      "Calculate recommended solar system capacity based on monthly bill, tariff, and roof area. Returns capacity in kW and flags if roof area is limiting.",
    inputSchema: {
      type: "object",
      properties: {
        monthly_bill: {
          type: "number",
          description: "Monthly electricity bill in INR",
        },
        tariff_per_kwh: {
          type: "number",
          description: "Electricity tariff in INR/kWh",
        },
        roof_area_sqft: {
          type: "number",
          description: "Usable roof area in square feet",
        },
        monthly_units: {
          type: "number",
          description: "Optional: monthly consumption in kWh (if not provided, derived from bill/tariff)",
        },
      },
      required: ["monthly_bill", "tariff_per_kwh", "roof_area_sqft"],
    },
  },
  {
    name: "estimate_installation_cost",
    description:
      "Estimate total installation cost for a solar system. Uses default cost per kW (₹55K–₹70K) or custom value.",
    inputSchema: {
      type: "object",
      properties: {
        capacity_kw: {
          type: "number",
          description: "Solar system capacity in kW",
        },
        cost_per_kw: {
          type: "number",
          description: "Cost per kW in INR (optional, default ₹62,500)",
        },
      },
      required: ["capacity_kw"],
    },
  },
  {
    name: "calculate_subsidy",
    description:
      "Calculate PM Surya Ghar subsidy for a given system capacity using tiered lookup table. Returns subsidy amount in INR.",
    inputSchema: {
      type: "object",
      properties: {
        capacity_kw: {
          type: "number",
          description: "Solar system capacity in kW",
        },
      },
      required: ["capacity_kw"],
    },
  },
  {
    name: "calculate_roi",
    description:
      "Calculate ROI metrics: final cost after subsidy, monthly/annual savings, payback period, 25-year lifetime savings, and ROI percentage.",
    inputSchema: {
      type: "object",
      properties: {
        installation_cost: {
          type: "number",
          description: "Total installation cost in INR",
        },
        subsidy: {
          type: "number",
          description: "Subsidy amount in INR",
        },
        monthly_bill: {
          type: "number",
          description: "Current monthly electricity bill in INR",
        },
      },
      required: ["installation_cost", "subsidy", "monthly_bill"],
    },
  },
  {
    name: "calculate_environmental_impact",
    description:
      "Calculate environmental impact: annual energy generation, CO2 reduction (kg and tonnes), and equivalent trees saved.",
    inputSchema: {
      type: "object",
      properties: {
        capacity_kw: {
          type: "number",
          description: "Solar system capacity in kW",
        },
      },
      required: ["capacity_kw"],
    },
  },
];