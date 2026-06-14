// Carbon Footprint Calculation Module
// Emission factors are based on standard DEFRA / EPA / CoolClimate guidelines, scaled to annual kg CO2e.

export type CarType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none';
export type HeatingType = 'gas' | 'oil' | 'coal' | 'heatpump' | 'biomass' | 'none';
export type DietType = 'heavy-meat' | 'average-meat' | 'low-meat' | 'vegetarian' | 'vegan';
export type LocalOrganicPref = 'mostly' | 'average' | 'rarely';
export type ShoppingHabit = 'heavy' | 'average' | 'minimalist';
export type RecyclingHabit = 'everything' | 'some' | 'none';

export interface UserLifestyleData {
  // Transport
  carDistance: number; // km per week
  carType: CarType;
  transitDistance: number; // km per week (bus/train)
  flightHours: number; // hours per year

  // Energy
  electricityKwh: number; // kWh per month
  greenEnergyPct: number; // percentage (0 - 100)
  heatingType: HeatingType;
  householdSize: number; // number of people in household

  // Diet
  dietType: DietType;
  localOrganicPref: LocalOrganicPref;

  // Waste & Shopping
  shoppingHabit: ShoppingHabit;
  recyclingHabit: RecyclingHabit;
}

// Emission Factors (kg CO2e)
export const EMISSION_FACTORS = {
  // per km
  car: {
    petrol: 0.170,
    diesel: 0.171,
    hybrid: 0.100,
    electric: 0.047,
    none: 0,
  },
  transit: 0.040, // per km (average bus & rail mix)
  flight: 110, // per hour of flight time

  // electricity per kWh
  electricityGrid: 0.380, // kg CO2e per kWh (global average mix)

  // heating per month (for a standard household)
  heating: {
    gas: 180,
    oil: 260,
    coal: 350,
    heatpump: 50,
    biomass: 20,
    none: 0,
  },

  // diet per year (kg CO2e)
  diet: {
    'heavy-meat': 3300,
    'average-meat': 2500,
    'low-meat': 1700,
    'vegetarian': 1400,
    'vegan': 1000,
  },
  
  dietModifier: {
    mostly: -0.10, // -10% for local/organic
    average: 0.0,
    rarely: 0.10, // +10% for imported/heavy packaging
  },

  // waste & shopping per year (kg CO2e)
  shopping: {
    heavy: 3500,
    average: 1800,
    minimalist: 600,
  },

  recyclingReduction: {
    everything: -150,
    some: -50,
    none: 0,
  }
};

// Benchmarks for comparison (annual kg CO2e per person)
export const CO2_BENCHMARKS = {
  globalAverage: 4500,
  euAverage: 7500,
  usAverage: 16000,
  climateTarget: 2000, // Paris Agreement alignment target
};

/**
 * Calculates annual transport emissions in kg CO2e.
 */
export function calculateTransportEmissions(
  carDistanceWeekly: number,
  carType: CarType,
  transitDistanceWeekly: number,
  flightHoursAnnual: number
): number {
  const weeksPerYear = 52.143;
  const carEmissions = carDistanceWeekly * (EMISSION_FACTORS.car[carType] || 0) * weeksPerYear;
  const transitEmissions = transitDistanceWeekly * EMISSION_FACTORS.transit * weeksPerYear;
  const flightEmissions = flightHoursAnnual * EMISSION_FACTORS.flight;

  return Math.round(carEmissions + transitEmissions + flightEmissions);
}

/**
 * Calculates annual household energy emissions in kg CO2e (per person).
 */
export function calculateEnergyEmissions(
  electricityKwhMonthly: number,
  greenEnergyPct: number,
  heatingType: HeatingType,
  householdSize: number
): number {
  const size = Math.max(1, householdSize);
  const monthsPerYear = 12;

  // Grid electricity component
  const gridFraction = Math.max(0, Math.min(100, 100 - greenEnergyPct)) / 100;
  const annualElectricityKwh = electricityKwhMonthly * monthsPerYear;
  const electricityEmissions = (annualElectricityKwh * EMISSION_FACTORS.electricityGrid * gridFraction);

  // Heating component
  const annualHeatingEmissions = (EMISSION_FACTORS.heating[heatingType] || 0) * monthsPerYear;

  // Allocate per person in the household
  return Math.round((electricityEmissions + annualHeatingEmissions) / size);
}

/**
 * Calculates annual diet emissions in kg CO2e.
 */
export function calculateDietEmissions(
  dietType: DietType,
  localOrganicPref: LocalOrganicPref
): number {
  const baseEmissions = EMISSION_FACTORS.diet[dietType] || 1700;
  const modifier = EMISSION_FACTORS.dietModifier[localOrganicPref] || 0;
  return Math.round(baseEmissions * (1 + modifier));
}

/**
 * Calculates annual waste & shopping emissions in kg CO2e.
 */
export function calculateWasteEmissions(
  shoppingHabit: ShoppingHabit,
  recyclingHabit: RecyclingHabit
): number {
  const baseEmissions = EMISSION_FACTORS.shopping[shoppingHabit] || 1800;
  const reduction = EMISSION_FACTORS.recyclingReduction[recyclingHabit] || 0;
  return Math.round(Math.max(0, baseEmissions + reduction));
}

export interface EmissionsBreakdown {
  transport: number;
  energy: number;
  diet: number;
  waste: number;
  total: number;
}

/**
 * Computes the complete carbon footprint breakdown.
 */
export function calculateFootprint(data: UserLifestyleData): EmissionsBreakdown {
  const transport = calculateTransportEmissions(
    data.carDistance,
    data.carType,
    data.transitDistance,
    data.flightHours
  );

  const energy = calculateEnergyEmissions(
    data.electricityKwh,
    data.greenEnergyPct,
    data.heatingType,
    data.householdSize
  );

  const diet = calculateDietEmissions(
    data.dietType,
    data.localOrganicPref
  );

  const waste = calculateWasteEmissions(
    data.shoppingHabit,
    data.recyclingHabit
  );

  const total = transport + energy + diet + waste;

  return {
    transport,
    energy,
    diet,
    waste,
    total,
  };
}
