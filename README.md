# Solar Sathi MCP Module

A comprehensive Model Context Protocol (MCP) server for solar energy feasibility analysis and ROI calculation in India.

## Features

- **Solar Irradiance Lookup**: Fetch real solar radiation data from Open-Meteo API
- **System Capacity Calculation**: Recommend kW based on consumption and roof area
- **Installation Cost Estimation**: Get cost ranges with subsidy deduction
- **PM Surya Ghar Subsidy**: Tiered subsidy lookup (₹10K–₹18K/kW)
- **ROI Analysis**: Payback period, 25-year savings, and ROI percentage
- **Environmental Impact**: CO2 reduction and trees-saved equivalents
- **Homeowner Report**: LLM-generated or template-based feasibility reports

## Tools

### 1. `get_solar_irradiance`
Fetch average daily solar irradiance (kWh/m²/day) for a geographic location.

**Inputs:**
- `latitude` (number): -90 to 90
- `longitude` (number): -180 to 180

**Output:** Daily irradiance, location, data source note

---

### 2. `calculate_solar_capacity`
Recommend solar system size based on monthly bill, tariff, and roof area.

**Inputs:**
- `monthly_bill` (number): Monthly electricity bill (₹)
- `tariff_per_kwh` (number): Electricity tariff (₹/kWh)
- `roof_area_sqft` (number): Usable roof area (sqft)
- `monthly_units` (number, optional): Monthly consumption (kWh). If not provided, derived from bill/tariff.

**Output:** Capacity (kW), required roof area, roof-limited flag, monthly consumption

**Logic:**
- Capacity = monthly_consumption / 120 (assuming 120 units/kW/year)
- Required area = capacity × 100 sqft/kW
- If required area > available roof, cap capacity to roof_area / 100 and set `roof_limited: true`

---

### 3. `estimate_installation_cost`
Get installation cost estimate (all-inclusive: panels, inverter, BOP, labor, permits).

**Inputs:**
- `capacity_kw` (number): System capacity (kW)
- `cost_per_kw` (number, optional): Cost per kW (₹). Default: ₹62,500

**Output:** Total cost, cost range (min/max), capacity

---

### 4. `calculate_subsidy`
Look up PM Surya Ghar subsidy using tiered table.

**Inputs:**
- `capacity_kw` (number): System capacity (kW)

**Output:** Subsidy per kW, total subsidy, tier description

**Tiers:**
| Capacity (kW) | Subsidy (₹/kW) | Category |
|---|---|---|
| 0–3 | 18,000 | Residential ≤3 kW |
| 3.01–10 | 15,000 | Residential 3–10 kW |
| 10.01–100 | 12,000 | Small Commercial/Industrial |
| >100 | 10,000 | Large Scale |

---

### 5. `calculate_roi`
Calculate ROI metrics: payback period, annual/lifetime savings, and ROI percentage.

**Inputs:**
- `installation_cost` (number): Total cost (₹)
- `subsidy` (number): Subsidy amount (₹)
- `monthly_bill` (number): Current monthly bill (₹)

**Output:**
- Final cost after subsidy
- Monthly/annual savings
- Payback period (years)
- 25-year lifetime savings
- ROI percentage

**Logic:**
- Final cost = installation_cost - subsidy
- Monthly savings = monthly_bill (assumed fully offset)
- Annual savings = monthly_savings × 12
- Payback = final_cost / annual_savings
- Lifetime (25yr) = annual_savings × 25
- ROI% = ((lifetime - final_cost) / final_cost) × 100

---

### 6. `calculate_environmental_impact`
Calculate CO2 reduction and equivalent trees saved.

**Inputs:**
- `capacity_kw` (number): System capacity (kW)

**Output:**
- Annual energy generation (kWh)
- CO2 reduction (kg and tonnes)
- Trees saved (equivalent)

**Logic:**
- Annual energy = capacity × 120 × 12 (120 units/kW/year)
- CO2 reduction = annual_energy × 0.82 kg/kWh
- Trees saved = CO2_reduction / 21 kg/tree/year

---

## Resources

### `solar://subsidy-table`
PM Surya Ghar subsidy lookup table (JSON).

### `solar://state-tariffs`
State-wise residential electricity tariffs (JSON).

### `solar://installation-costs`
Default cost per kW and regional multipliers (JSON).

---

## Prompts

### `generate_homeowner_report`
Generate a comprehensive homeowner-friendly solar feasibility report.

**Inputs:** All tool outputs (irradiance, capacity, cost, subsidy, ROI, environmental)

**Output:** Plain-English report covering:
- Feasibility assessment
- System recommendation (on-grid/off-grid/hybrid)
- Financial summary with payback period
- Environmental impact (relatable language)
- Action items (next steps)

**Behavior:**
- Attempts to use OpenAI or Gemini API if keys are configured
- Falls back to template-based report if no LLM key available

---

## Environment Variables