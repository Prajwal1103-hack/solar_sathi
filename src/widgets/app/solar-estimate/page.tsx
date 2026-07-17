'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface SolarEstimateData {
  roofAreaSqm: number;
  usableAreaSqm: number;
  recommendedSystemSizeKw: number;
  numberOfPanels: number;
  estimatedAnnualGenerationKwh: number;
  estimatedMonthlyGenerationKwh: number;
  performanceRatio: number;
  co2OffsetPerYear: number;
}

export default function SolarEstimate() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();

  const data = getToolOutput<SolarEstimateData>();

  if (!isReady) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: theme === 'dark' ? '#fff' : '#000',
        }}
      >
        Initializing...
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          color: theme === 'dark' ? '#fff' : '#000',
        }}
      >
        Loading solar estimate...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#f3f4f6';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const accentColor = '#3b82f6';

  return (
    <div
      style={{
        padding: '24px',
        background: bgColor,
        borderRadius: '16px',
        color: textColor,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
          ☀️ Solar Potential Estimate
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: mutedColor }}>
          Rooftop solar system sizing and generation forecast
        </p>
      </div>

      {/* Main metrics grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* System Size Card */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Recommended System Size
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: accentColor,
            }}
          >
            {data.recommendedSystemSizeKw} kW
          </p>
        </div>

        {/* Panel Count Card */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Number of Panels (400W)
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 'bold',
              color: accentColor,
            }}
          >
            {data.numberOfPanels}
          </p>
        </div>

        {/* Annual Generation Card */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Annual Generation
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: accentColor,
            }}
          >
            {data.estimatedAnnualGenerationKwh.toLocaleString()} kWh
          </p>
        </div>

        {/* Monthly Average Card */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Monthly Average
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: accentColor,
            }}
          >
            {data.estimatedMonthlyGenerationKwh.toLocaleString()} kWh
          </p>
        </div>
      </div>

      {/* Details section */}
      <div
        style={{
          background: cardBg,
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        }}
      >
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: 'bold',
            color: textColor,
          }}
        >
          System Details
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: mutedColor }}>Roof Area</span>
            <span style={{ fontWeight: 'bold' }}>
              {data.roofAreaSqm} m²
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: mutedColor }}>Usable Area (80%)</span>
            <span style={{ fontWeight: 'bold' }}>
              {data.usableAreaSqm} m²
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: mutedColor }}>Performance Ratio</span>
            <span style={{ fontWeight: 'bold' }}>
              {(data.performanceRatio * 100).toFixed(1)}%
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <span style={{ color: mutedColor, fontWeight: 'bold' }}>
              CO₂ Offset/Year
            </span>
            <span style={{ fontWeight: 'bold', color: '#10b981' }}>
              {data.co2OffsetPerYear.toLocaleString()} kg
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: '16px',
          fontSize: '12px',
          color: mutedColor,
          textAlign: 'center',
        }}
      >
        💡 Estimates based on average solar irradiance and system efficiency
      </div>
    </div>
  );
}
