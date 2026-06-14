import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmissions,
  calculateEnergyEmissions,
  calculateDietEmissions,
  calculateWasteEmissions,
  calculateFootprint
} from './calculator';
import type { UserLifestyleData } from './calculator';

describe('Carbon Calculator Logic', () => {
  describe('Transport Emissions', () => {
    it('should calculate zero transport emissions for someone with no travel', () => {
      const emissions = calculateTransportEmissions(0, 'none', 0, 0);
      expect(emissions).toBe(0);
    });

    it('should calculate transport emissions for petrol cars', () => {
      // 100 km/week, petrol (0.170 kg/km) -> 17 kg/week * 52.143 weeks = ~886 kg
      const emissions = calculateTransportEmissions(100, 'petrol', 0, 0);
      expect(emissions).toBe(886);
    });

    it('should calculate transport emissions for electric cars', () => {
      // 100 km/week, electric (0.047 kg/km) -> 4.7 kg/week * 52.143 weeks = ~245 kg
      const emissions = calculateTransportEmissions(100, 'electric', 0, 0);
      expect(emissions).toBe(245);
    });

    it('should include flights and transit in calculations', () => {
      // 50 km/week transit (0.040 kg/km) * 52.143 = ~104 kg
      // 10 flight hours * 110 kg/hour = 1100 kg
      // Total = ~1204 kg
      const emissions = calculateTransportEmissions(0, 'none', 50, 10);
      expect(emissions).toBe(1204);
    });
  });

  describe('Energy Emissions', () => {
    it('should split household energy across occupants', () => {
      // Single person: 300 kWh/month, 0% green, gas heating
      // Electricity: 300 * 12 * 0.380 = 1368 kg CO2e
      // Heating: Gas (180/month * 12) = 2160 kg CO2e
      // Total: 3528 kg / 1 person = 3528 kg
      const singlePerson = calculateEnergyEmissions(300, 0, 'gas', 1);
      expect(singlePerson).toBe(3528);

      // Two people: same house, emissions should be halved per person
      const twoPeople = calculateEnergyEmissions(300, 0, 'gas', 2);
      expect(twoPeople).toBe(Math.round(3528 / 2));
    });

    it('should apply green energy discounts correctly', () => {
      // 300 kWh/month, 100% green energy, gas heating, 1 person
      // Electricity: 0 kg (due to 100% green energy)
      // Heating: Gas = 2160 kg
      // Total = 2160 kg
      const greenEnergy = calculateEnergyEmissions(300, 100, 'gas', 1);
      expect(greenEnergy).toBe(2160);

      // 50% green energy, 1 person, gas heating
      // Electricity: 300 * 12 * 0.380 * 0.5 = 684 kg
      // Heating: Gas = 2160 kg
      // Total = 2844 kg
      const halfGreen = calculateEnergyEmissions(300, 50, 'gas', 1);
      expect(halfGreen).toBe(2844);
    });
  });

  describe('Diet Emissions', () => {
    it('should return appropriate base emissions for diet choices', () => {
      expect(calculateDietEmissions('vegan', 'average')).toBe(1000);
      expect(calculateDietEmissions('vegetarian', 'average')).toBe(1400);
      expect(calculateDietEmissions('heavy-meat', 'average')).toBe(3300);
    });

    it('should apply modifiers for local/organic preference', () => {
      // Vegan mostly local/organic: 1000 * (1 - 0.10) = 900
      expect(calculateDietEmissions('vegan', 'mostly')).toBe(900);

      // Vegan rarely local/organic: 1000 * (1 + 0.10) = 1100
      expect(calculateDietEmissions('vegan', 'rarely')).toBe(1100);
    });
  });

  describe('Waste and Shopping Emissions', () => {
    it('should apply shopping habits and recycling discounts', () => {
      // Minimalist: 600 kg base, recycling everything (-150) = 450 kg
      expect(calculateWasteEmissions('minimalist', 'everything')).toBe(450);

      // Heavy: 3500 kg base, recycling none (0) = 3500 kg
      expect(calculateWasteEmissions('heavy', 'none')).toBe(3500);
    });

    it('should not fall below 0 emissions', () => {
      // Fallback check to avoid negative values
      expect(calculateWasteEmissions('minimalist', 'everything')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Total Footprint Integration', () => {
    it('should aggregate all categories correctly', () => {
      const mockData: UserLifestyleData = {
        carDistance: 100, // petrol: ~886 kg
        carType: 'petrol',
        transitDistance: 50, // transit: ~104 kg
        flightHours: 10, // flights: 1100 kg
        // Transport total = 2090 kg

        electricityKwh: 200, // electricity: 200 * 12 * 0.38 * (1 - 0.5) = 456 kg
        greenEnergyPct: 50,
        heatingType: 'heatpump', // heating: 50 * 12 = 600 kg
        householdSize: 2, // energy total = (456 + 600) / 2 = 528 kg

        dietType: 'vegetarian', // diet: 1400 * 0.9 = 1260 kg
        localOrganicPref: 'mostly',

        shoppingHabit: 'average', // waste: 1800 - 50 = 1750 kg
        recyclingHabit: 'some'
      };

      const breakdown = calculateFootprint(mockData);

      expect(breakdown.transport).toBe(2091);
      expect(breakdown.energy).toBe(528);
      expect(breakdown.diet).toBe(1260);
      expect(breakdown.waste).toBe(1750);
      expect(breakdown.total).toBe(2091 + 528 + 1260 + 1750);
    });
  });
});
