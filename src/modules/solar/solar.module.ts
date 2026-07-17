/**
 * SolarModule
 * Feature module for solar potential estimation and ROI calculation
 */

import { Module } from '@nitrostack/core';
import { SolarTools } from './solar.tools.js';
import { LocationService } from '../../services/location.service.js';
import { SolarDataService } from '../../services/solar-data.service.js';
import { SolarCalculationService } from '../../services/solar-calculation.service.js';
import { SubsidyService } from '../../services/subsidy.service.js';

@Module({
  name: 'solar',
  description: 'Solar potential estimation and ROI calculation for Indian homeowners',
  controllers: [SolarTools],
  providers: [
    LocationService,
    SolarDataService,
    SolarCalculationService,
    SubsidyService,
  ],
})
export class SolarModule {}
