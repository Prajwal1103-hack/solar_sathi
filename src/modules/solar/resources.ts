import { Resource } from "@modelcontextprotocol/sdk/types.js";
import subsidyTable from "../../data/pm_surya_ghar_subsidy_table.json" assert { type: "json" };
import tariffTable from "../../data/state_tariff_table.json" assert { type: "json" };
import costDefaults from "../../data/installation_cost_defaults.json" assert { type: "json" };

export const solarResources: Resource[] = [
  {
    uri: "solar://subsidy-table",
    name: "PM Surya Ghar Subsidy Table",
    description: "Current subsidy amounts (₹/kW) by system capacity tier",
    mimeType: "application/json",
  },
  {
    uri: "solar://state-tariffs",
    name: "State Electricity Tariffs",
    description: "Residential electricity tariff rates by state (₹/kWh)",
    mimeType: "application/json",
  },
  {
    uri: "solar://installation-costs",
    name: "Installation Cost Defaults",
    description: "Default cost per kW ranges and regional multipliers",
    mimeType: "application/json",
  },
];

export async function getSolarResourceContent(uri: string): Promise<string> {
  switch (uri) {
    case "solar://subsidy-table":
      return JSON.stringify(subsidyTable, null, 2);
    case "solar://state-tariffs":
      return JSON.stringify(tariffTable, null, 2);
    case "solar://installation-costs":
      return JSON.stringify(costDefaults, null, 2);
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}