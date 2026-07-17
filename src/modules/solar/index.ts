import { Tool, Prompt, Resource } from "@modelcontextprotocol/sdk/types.js";
import { solarTools } from "./tools.js";
import { solarResources, getSolarResourceContent } from "./resources.js";
import { solarPrompts } from "./prompts.js";

export { solarTools, solarResources, getSolarResourceContent, solarPrompts };

export interface SolarModule {
  tools: Tool[];
  resources: Resource[];
  prompts: Prompt[];
  getResourceContent: (uri: string) => Promise<string>;
}

export const solarModule: SolarModule = {
  tools: solarTools,
  resources: solarResources,
  prompts: solarPrompts,
  getResourceContent: getSolarResourceContent,
};