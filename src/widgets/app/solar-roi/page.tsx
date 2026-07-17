'use client';

import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface SolarROIData {
  systemSizeKw: number;
  installationCostInr: number;
  totalInstallationCostInr: number;
  subsidyAmountInr: number;
  netCostAfterSubsidyInr: number;
  annualElectricityBillSavingsInr: number;
  paybackPeriodYears: number;
  annualCo2ReductionKg: number;
  recommendation: string;
}

export default function SolarROI() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();

  const data = getToolOutput<SolarROIData>();

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
        Loading ROI analysis...
      </div>
    );
  }

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#f3f4f6';
  const cardBg = isDark ? '#111827' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const accentColor = '#3b82f6';
  const successColor = '#10b981';
  const warningColor = '#f59e0b';

  // Determine recommendation color
  const getRecommendationColor = () => {
    if (data.paybackPeriodYears <= 5) return successColor;
    if (data.paybackPeriodYears <= 7) return accentColor;
    if (data.paybackPeriodYears <= 10) return warningColor;
    return '#ef4444';
  };

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
          💰 Solar ROI Analysis
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: mutedColor }}>
          Financial breakdown with PM Surya Ghar subsidy
        </p>
      </div>

      {/* Cost Breakdown */}
      <div
        style={{
          background: cardBg,
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          marginBottom: '16px',
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
          Installation Cost Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <span style={{ color: mutedColor }}>Total Installation Cost</span>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
              ₹{data.totalInstallationCostInr.toLocaleString()}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingBottom: '10px',
              borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            }}
          >
            <span style={{ color: mutedColor }}>PM Surya Ghar Subsidy</span>
            <span style={{ fontWeight: 'bold', fontSize: '16px', color: successColor }}>
              -₹{data.subsidyAmountInr.toLocaleString()}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '10px',
            }}
          >
            <span style={{ fontWeight: 'bold', color: textColor }}>
              Net Cost After Subsidy
            </span>
            <span
              style={{
                fontWeight: 'bold',
                fontSize: '18px',
                color: accentColor,
              }}
            >
              ₹{data.netCostAfterSubsidyInr.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {/* Annual Savings */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Annual Bill Savings
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: successColor,
            }}
          >
            ₹{data.annualElectricityBillSavingsInr.toLocaleString()}
          </p>
        </div>

        {/* Payback Period */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Payback Period
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: getRecommendationColor(),
            }}
          >
            {data.paybackPeriodYears} years
          </p>
        </div>

        {/* System Size */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            System Size
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: accentColor,
            }}
          >
            {data.systemSizeKw} kW
          </p>
        </div>

        {/* CO2 Reduction */}
        <div
          style={{
            background: cardBg,
            padding: '16px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: mutedColor }}>
            Annual CO₂ Reduction
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
              color: successColor,
            }}
          >
            {data.annualCo2ReductionKg.toLocaleString()} kg
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div
        style={{
          background: `${getRecommendationColor()}20`,
          border: `2px solid ${getRecommendationColor()}`,
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 'bold',
            color: getRecommendationColor(),
          }}
        >
          {data.paybackPeriodYears <= 5 ? '✅' : data.paybackPeriodYears <= 7 ? '👍' : data.paybackPeriodYears <= 10 ? '⚠️' : '❌'}{' '}
          {data.recommendation}
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: '12px',
          color: mutedColor,
          textAlign: 'center',
        }}
      >
        💡 Calculations based on 2024 PM Surya Ghar subsidy rates and average electricity costs
      </div>
    </div>
  );
}
