import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const solarPrompts: Prompt[] = [
  {
    name: "generate_homeowner_report",
    description:
      "Generate a comprehensive homeowner solar feasibility and ROI report. Provide all tool outputs as context (irradiance, capacity, cost, subsidy, ROI, environmental impact). Returns a plain-English recommendation covering system type, ROI, environmental impact, and savings outlook.",
    arguments: [
      {
        name: "irradiance_data",
        description: "Output from get_solar_irradiance tool",
        required: true,
      },
      {
        name: "capacity_data",
        description: "Output from calculate_solar_capacity tool",
        required: true,
      },
      {
        name: "cost_data",
        description: "Output from estimate_installation_cost tool",
        required: true,
      },
      {
        name: "subsidy_data",
        description: "Output from calculate_subsidy tool",
        required: true,
      },
      {
        name: "roi_data",
        description: "Output from calculate_roi tool",
        required: true,
      },
      {
        name: "environmental_data",
        description: "Output from calculate_environmental_impact tool",
        required: true,
      },
    ],
  },
];

export function generateHomeownerReportPrompt(
  irradianceData: Record<string, unknown>,
  capacityData: Record<string, unknown>,
  costData: Record<string, unknown>,
  subsidyData: Record<string, unknown>,
  roiData: Record<string, unknown>,
  environmentalData: Record<string, unknown>
): string {
  return `You are a solar energy consultant. Based on the following technical data, generate a comprehensive homeowner-friendly solar feasibility report.

**Solar Irradiance Data:**
${JSON.stringify(irradianceData, null, 2)}

**System Capacity Analysis:**
${JSON.stringify(capacityData, null, 2)}

**Installation Cost Estimate:**
${JSON.stringify(costData, null, 2)}

**Subsidy Information:**
${JSON.stringify(subsidyData, null, 2)}

**ROI & Financial Analysis:**
${JSON.stringify(roiData, null, 2)}

**Environmental Impact:**
${JSON.stringify(environmentalData, null, 2)}

Please provide a report that includes:
1. **Feasibility Assessment** – Is solar a good fit? (consider roof area, irradiance, financial metrics)
2. **System Recommendation** – On-grid, off-grid, or hybrid? Why?
3. **Financial Summary** – Cost, subsidy, net investment, payback period, 25-year savings in plain language
4. **Environmental Impact** – CO2 reduction and trees saved (make it relatable)
5. **Action Items** – Next steps for the homeowner (site survey, permits, financing, etc.)

Use INR currency. Be encouraging but realistic. Avoid jargon where possible.`;
}

// Fallback response if LLM is unavailable
export function generateHomeownerReportFallback(
  irradianceData: Record<string, unknown>,
  capacityData: Record<string, unknown>,
  costData: Record<string, unknown>,
  subsidyData: Record<string, unknown>,
  roiData: Record<string, unknown>,
  environmentalData: Record<string, unknown>
): string {
  const capacity = (capacityData as any)?.capacity_kw ?? "N/A";
  const roofLimited = (capacityData as any)?.roof_limited ?? false;
  const finalCost = (roiData as any)?.final_cost_after_subsidy ?? "N/A";
  const payback = (roiData as any)?.payback_period_years ?? "N/A";
  const lifetimeSavings = (roiData as any)?.lifetime_savings_25yr ?? "N/A";
  const trees = (environmentalData as any)?.trees_saved ?? "N/A";

  return `
## Solar Feasibility Report

### Feasibility Assessment
Your location receives good solar irradiance. A ${capacity} kW system is recommended based on your electricity consumption and available roof space${roofLimited ? " (roof area is the limiting factor)" : ""}.

### System Recommendation
**On-grid solar system** is recommended. This allows you to draw from the grid during low-sun periods and export excess generation, maximizing ROI.

### Financial Summary
- **Total Investment:** ₹${(costData as any)?.total_cost_inr?.toLocaleString('en-IN') ?? 'N/A'}
- **Subsidy Available:** ₹${(subsidyData as any)?.total_subsidy_inr?.toLocaleString('en-IN') ?? 'N/A'}
- **Net Cost After Subsidy:** ₹${typeof finalCost === 'number' ? finalCost.toLocaleString('en-IN') : finalCost}
- **Payback Period:** ${payback} years
- **25-Year Savings:** ₹${typeof lifetimeSavings === 'number' ? lifetimeSavings.toLocaleString('en-IN') : lifetimeSavings}

### Environmental Impact
Your system will save approximately **${trees} trees' worth of CO2** annually. That's real climate action!

### Next Steps
1. Get a professional solar site survey (free from most installers)
2. Apply for PM Surya Ghar subsidy
3. Compare quotes from 2–3 certified installers
4. Arrange financing (bank loans, MNRE schemes available)
5. Get permits from your local authority
6. Installation typically takes 2–4 weeks

**Solar Sathi recommends proceeding.** The numbers work in your favor.
`;
}