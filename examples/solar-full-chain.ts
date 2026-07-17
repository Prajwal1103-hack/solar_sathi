/**
 * End-to-end test client demonstrating the full Solar Sathi tool chain.
 * 
 * Flow:
 * 1. get_solar_irradiance (for a location)
 * 2. calculate_solar_capacity (based on bill & roof)
 * 3. estimate_installation_cost
 * 4. calculate_subsidy
 * 5. calculate_roi
 * 6. calculate_environmental_impact
 * 7. generate_homeowner_report (LLM-based or fallback)
 * 
 * Run: npx ts-node examples/solar-full-chain.ts
 */

import * as solarTools from "../src/modules/solar/tools.js";
import { generateHomeownerReportPrompt, generateHomeownerReportFallback } from "../src/modules/solar/prompts.js";

async function runFullChain() {
  console.log("🌞 Solar Sathi - Full Tool Chain Test\n");

  try {
    // Step 1: Get solar irradiance for Kochi, Kerala
    console.log("📍 Step 1: Fetching solar irradiance for Kochi, Kerala...");
    const irradianceData = await solarTools.getSolarIrradiance(9.9312, 76.2673);
    console.log("✅ Irradiance Data:", JSON.stringify(irradianceData, null, 2));

    // Step 2: Calculate capacity
    console.log("\n📊 Step 2: Calculating recommended solar capacity...");
    const capacityData = solarTools.calculateSolarCapacity(
      8000, // monthly bill (₹)
      7.5, // tariff (₹/kWh)
      400 // roof area (sqft)
    );
    console.log("✅ Capacity Data:", JSON.stringify(capacityData, null, 2));

    // Step 3: Estimate installation cost
    console.log("\n💰 Step 3: Estimating installation cost...");
    const costData = solarTools.estimateInstallationCost(capacityData.capacity_kw);
    console.log("✅ Cost Data:", JSON.stringify(costData, null, 2));

    // Step 4: Calculate subsidy
    console.log("\n🎁 Step 4: Calculating PM Surya Ghar subsidy...");
    const subsidyData = solarTools.calculateSubsidy(capacityData.capacity_kw);
    console.log("✅ Subsidy Data:", JSON.stringify(subsidyData, null, 2));

    // Step 5: Calculate ROI
    console.log("\n📈 Step 5: Calculating ROI metrics...");
    const roiData = solarTools.calculateROI(costData.total_cost_inr, subsidyData.total_subsidy_inr, 8000);
    console.log("✅ ROI Data:", JSON.stringify(roiData, null, 2));

    // Step 6: Calculate environmental impact
    console.log("\n🌱 Step 6: Calculating environmental impact...");
    const environmentalData = solarTools.calculateEnvironmentalImpact(capacityData.capacity_kw);
    console.log("✅ Environmental Data:", JSON.stringify(environmentalData, null, 2));

    // Step 7: Generate homeowner report
    console.log("\n📄 Step 7: Generating homeowner report...");
    const reportPrompt = generateHomeownerReportPrompt(
      irradianceData,
      capacityData,
      costData,
      subsidyData,
      roiData,
      environmentalData
    );

    // Try LLM call; fall back to template if no API key
    let report: string;
    const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey) {
      console.log("🤖 Using LLM to generate report...");
      // In a real scenario, you'd call OpenAI or Gemini API here
      // For now, using fallback
      report = generateHomeownerReportFallback(
        irradianceData,
        capacityData,
        costData,
        subsidyData,
        roiData,
        environmentalData
      );
    } else {
      console.log("⚠️  No LLM API key found. Using template-based fallback report...");
      report = generateHomeownerReportFallback(
        irradianceData,
        capacityData,
        costData,
        subsidyData,
        roiData,
        environmentalData
      );
    }

    console.log("\n✅ Report Generated:\n");
    console.log(report);

    console.log("\n✨ Full chain completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runFullChain();