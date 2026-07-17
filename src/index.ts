import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListPromptsRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import solar module instead of calculator
import { solarModule } from "./modules/solar/index.js";
import * as solarTools from "./modules/solar/tools.js";

const server = new Server(
  {
    name: "solar-sathi",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {},
    },
  }
);

// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: solarModule.tools,
  };
});

// Call tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      case "get_solar_irradiance": {
        const { latitude, longitude } = args as { latitude: number; longitude: number };
        result = await solarTools.getSolarIrradiance(latitude, longitude);
        break;
      }
      case "calculate_solar_capacity": {
        const { monthly_bill, tariff_per_kwh, roof_area_sqft, monthly_units } = args as {
          monthly_bill: number;
          tariff_per_kwh: number;
          roof_area_sqft: number;
          monthly_units?: number;
        };
        result = solarTools.calculateSolarCapacity(monthly_bill, tariff_per_kwh, roof_area_sqft, monthly_units);
        break;
      }
      case "estimate_installation_cost": {
        const { capacity_kw, cost_per_kw } = args as { capacity_kw: number; cost_per_kw?: number };
        result = solarTools.estimateInstallationCost(capacity_kw, cost_per_kw);
        break;
      }
      case "calculate_subsidy": {
        const { capacity_kw } = args as { capacity_kw: number };
        result = solarTools.calculateSubsidy(capacity_kw);
        break;
      }
      case "calculate_roi": {
        const { installation_cost, subsidy, monthly_bill } = args as {
          installation_cost: number;
          subsidy: number;
          monthly_bill: number;
        };
        result = solarTools.calculateROI(installation_cost, subsidy, monthly_bill);
        break;
      }
      case "calculate_environmental_impact": {
        const { capacity_kw } = args as { capacity_kw: number };
        result = solarTools.calculateEnvironmentalImpact(capacity_kw);
        break;
      }
      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
});

// List resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: solarModule.resources,
  };
});

// Read resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  try {
    const content = await solarModule.getResourceContent(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: content,
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `Error reading resource: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// List prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: solarModule.prompts,
  };
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("Solar Sathi MCP server started");