/**
 * SolarTools
 * MCP tools for solar potential estimation and ROI calculation
 */

import { ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { LocationService } from '../../services/location.service.js';
import { SolarDataService } from '../../services/solar-data.service.js';
import { SolarCalculationService } from '../../services/solar-calculation.service.js';
import { SubsidyService } from '../../services/subsidy.service.js';

@Injectable({
  deps: [
    LocationService,
    SolarDataService,
    SolarCalculationService,
    SubsidyService,
  ],
})
export class SolarTools {
  constructor(
    private locationService: LocationService,
    private solarDataService: SolarDataService,
    private solarCalculationService: SolarCalculationService,
    private subsidyService: SubsidyService
  ) {}

  @Tool({
    name: 'get_location',
    description:
      'Get geographic coordinates for an Indian city. Supports formats like "Kochi, Kerala" or just "Kochi".',
    inputSchema: z.object({
      location: z
        .string()
        .describe('City name and optional state, e.g., "Kochi, Kerala"'),
    }),
  })
  async getLocation(
    input: { location: string },
    ctx: ExecutionContext
  ): Promise<object> {
    ctx.logger.info(`Getting location for: ${input.location}`);
    const result = await this.locationService.getLocation(input.location);

    if (!result.found) {
      ctx.logger.warn(`Location not found: ${input.location}`);
    }

    return result;
  }

  @Tool({
    name: 'get_solar_data',
    description:
      'Fetch solar irradiance and weather data for a geographic location.',
    inputSchema: z.object({
      latitude: z.number().describe('Latitude coordinate'),
      longitude: z.number().describe('Longitude coordinate'),
      cityName: z
        .string()
        .optional()
        .describe('City name for baseline irradiance lookup'),
    }),
  })
  async getSolarData(
    input: { latitude: number; longitude: number; cityName?: string },
    ctx: ExecutionContext
  ): Promise<object> {
    ctx.logger.info(
      `Getting solar data for lat=${input.latitude}, lon=${input.longitude}`
    );
    const result = await this.solarDataService.getSolarData(
      input.latitude,
      input.longitude,
      input.cityName
    );
    return result;
  }

  @Tool({
    name: 'calculate_solar',
    description:
      'Calculate rooftop solar potential: system size, panel count, annual generation, and CO2 offset.',
    inputSchema: z.object({
      roofAreaSqm: z
        .number()
        .positive()
        .describe('Usable roof area in square meters'),
      dailyIrradiance: z
        .number()
        .positive()
        .describe('Average daily solar irradiance in kWh/m²/day'),
      systemEfficiency: z
        .number()
        .optional()
        .describe('System efficiency (0-1, default 0.75)'),
      panelEfficiency: z
        .number()
        .optional()
        .describe('Panel efficiency (0-1, default 0.18)'),
    }),
  })
  @Widget('solar-estimate')
  async calculateSolar(
    input: {
      roofAreaSqm: number;
      dailyIrradiance: number;
      systemEfficiency?: number;
      panelEfficiency?: number;
    },
    ctx: ExecutionContext
  ): Promise<object> {
    ctx.logger.info(
      `Calculating solar potential for roof area: ${input.roofAreaSqm} sqm`
    );
    const result = this.solarCalculationService.calculateSolarPotential(input);
    return result;
  }

  @Tool({
    name: 'calculate_roi',
    description:
      'Calculate ROI, subsidy, payback period, and financial metrics for a solar installation.',
    inputSchema: z.object({
      systemSizeKw: z
        .number()
        .positive()
        .describe('Solar system size in kilowatts'),
      annualGenerationKwh: z
        .number()
        .positive()
        .describe('Estimated annual electricity generation in kWh'),
      roofAreaSqm: z
        .number()
        .positive()
        .describe('Roof area in square meters'),
    }),
  })
  @Widget('solar-roi')
  async calculateRoi(
    input: {
      systemSizeKw: number;
      annualGenerationKwh: number;
      roofAreaSqm: number;
    },
    ctx: ExecutionContext
  ): Promise<object> {
    ctx.logger.info(
      `Calculating ROI for system size: ${input.systemSizeKw} kW`
    );
    const result = this.subsidyService.calculateSubsidy(input);
    return result;
  }
}
