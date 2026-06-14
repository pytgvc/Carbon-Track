import React, { useState, useEffect } from 'react';
import type { EmissionsBreakdown } from '../utils/calculator';
import { Lightbulb, Plus, Check } from 'lucide-react';

export interface ActionItem {
  id: string;
  category: 'transport' | 'energy' | 'diet' | 'waste';
  title: string;
  impactText: string;
  description: string;
  annualSavings: number; // in kg CO2e
  dailySavings: number; // in kg CO2e (approx savings per occurrence)
}

const ALL_SUGGESTIONS: ActionItem[] = [
  // Transport
  {
    id: 'transit_swap',
    category: 'transport',
    title: 'Swap 1 Car Drive for Transit',
    impactText: 'High Impact',
    description: 'Use the bus, subway, or train instead of driving solo for a standard 20km trip once a week.',
    annualSavings: 150,
    dailySavings: 3.0
  },
  {
    id: 'flight_reduction',
    category: 'transport',
    title: 'Choose Trains over Short Flights',
    impactText: 'Critical Impact',
    description: 'Take high-speed rail instead of a domestic flight for one holiday trip this year.',
    annualSavings: 350,
    dailySavings: 30.0 // large saving per flight logged
  },
  {
    id: 'eco_driving',
    category: 'transport',
    title: 'Practice Eco-Driving',
    impactText: 'Medium Impact',
    description: 'Keep tires properly inflated, avoid rapid acceleration, and turn off your engine when idling.',
    annualSavings: 80,
    dailySavings: 0.3
  },
  // Energy
  {
    id: 'green_tariff',
    category: 'energy',
    title: 'Switch to a Renewable Energy Tariff',
    impactText: 'Critical Impact',
    description: 'Upgrade your home electricity contract to 100% green source (solar/wind).',
    annualSavings: 800,
    dailySavings: 2.2 // constant daily savings scaled down
  },
  {
    id: 'thermostat_down',
    category: 'energy',
    title: 'Lower Thermostat by 1°C',
    impactText: 'High Impact',
    description: 'Reduce heating by just 1 degree during winter months. Wear a cozy sweater instead.',
    annualSavings: 140,
    dailySavings: 0.8
  },
  {
    id: 'cold_wash_dry',
    category: 'energy',
    title: 'Wash Clothes Cold & Line Dry',
    impactText: 'Medium Impact',
    description: 'Use 30°C cycles or lower for your laundry, and hang-dry clothes instead of using a dryer.',
    annualSavings: 110,
    dailySavings: 1.5 // per load saved
  },
  // Diet
  {
    id: 'veggie_day',
    category: 'diet',
    title: 'Host Meatless Mondays',
    impactText: 'High Impact',
    description: 'Replace all meat dishes with plant-based alternatives for one full day each week.',
    annualSavings: 200,
    dailySavings: 3.8
  },
  {
    id: 'local_organic',
    category: 'diet',
    title: 'Source Local & Seasonal Produce',
    impactText: 'Medium Impact',
    description: 'Buy vegetables grown in your region rather than air-freighted imported items.',
    annualSavings: 120,
    dailySavings: 0.5
  },
  {
    id: 'zero_food_waste',
    category: 'diet',
    title: 'Reduce Domestic Food Waste',
    impactText: 'Medium Impact',
    description: 'Plan weekly meals, store foods properly, and use up leftovers before shopping.',
    annualSavings: 150,
    dailySavings: 0.8
  },
  // Waste/Shopping
  {
    id: 'secondhand_first',
    category: 'waste',
    title: 'Shop Secondhand First',
    impactText: 'High Impact',
    description: 'When buying clothes, books, or furniture, search thrift shops or online resale platforms first.',
    annualSavings: 250,
    dailySavings: 5.0 // per item purchased secondhand instead of new
  },
  {
    id: 'plastic_free',
    category: 'waste',
    title: 'Ditch Single-Use Plastic Bags & Bottles',
    impactText: 'Medium Impact',
    description: 'Always carry a reusable water bottle and canvas shopping bags when running errands.',
    annualSavings: 60,
    dailySavings: 0.2
  },
  {
    id: 'recycle_electronics',
    category: 'waste',
    title: 'Recycle and Compost Diligently',
    impactText: 'Medium Impact',
    description: 'Set up separate bin sorting for metals, paper, and compostable organic food scraps.',
    annualSavings: 150,
    dailySavings: 0.4
  }
];

interface InsightsPanelProps {
  breakdown: EmissionsBreakdown;
  committedActionIds: string[];
  onToggleCommit: (actionId: string) => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  breakdown,
  committedActionIds,
  onToggleCommit
}) => {
  const [highestCategory, setHighestCategory] = useState<'transport' | 'energy' | 'diet' | 'waste'>('transport');

  useEffect(() => {
    // Find the category with the highest emission
    const cats = [
      { name: 'transport', val: breakdown.transport },
      { name: 'energy', val: breakdown.energy },
      { name: 'diet', val: breakdown.diet },
      { name: 'waste', val: breakdown.waste }
    ] as const;

    const highest = cats.reduce((prev, current) => (current.val > prev.val ? current : prev), cats[0]);
    setHighestCategory(highest.name);
  }, [breakdown]);

  // Filter recommendations: show highest category first, then others
  const primarySuggestions = ALL_SUGGESTIONS.filter(item => item.category === highestCategory);
  const secondarySuggestions = ALL_SUGGESTIONS.filter(item => item.category !== highestCategory);

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'transport': return 'Transportation';
      case 'energy': return 'Home Energy';
      case 'diet': return 'Diet & Food';
      case 'waste': return 'Shopping & Waste';
      default: return cat;
    }
  };

  return (
    <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Lightbulb color="var(--primary)" size={24} aria-hidden="true" />
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: 'var(--primary-dark)' }}>Personalized Eco-Actions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Actionable strategies based on your lifestyle profile.
          </p>
        </div>
      </div>

      {/* Focus Area Notification */}
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--primary-bg)',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'left',
        borderLeft: '4px solid var(--primary-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Highest Impact Area
        </span>
        <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text)' }}>
          Focus on: <strong>{getCategoryLabel(highestCategory)}</strong>
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
          Your emissions in this category make up <strong>{Math.round((breakdown[highestCategory] / Math.max(1, breakdown.total)) * 100)}%</strong> of your total footprint. Committing to actions in this area will yield your fastest reductions!
        </p>
      </div>

      {/* Primary Insights list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ textAlign: 'left', fontSize: '1rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
          Top recommendations for your profile
        </h4>

        {primarySuggestions.map(item => {
          const isCommitted = committedActionIds.includes(item.id);
          return (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px',
                border: `1px solid ${isCommitted ? 'var(--primary)' : 'var(--card-border)'}`,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isCommitted ? 'var(--primary-bg)' : 'var(--card-bg)',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text)' }}>{item.title}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: item.impactText.includes('Critical') ? 'var(--danger)' : 'var(--primary)',
                    backgroundColor: item.impactText.includes('Critical') ? 'var(--danger-bg)' : 'var(--primary-bg)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-round)'
                  }}>
                    {item.impactText}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{item.description}</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: 600, marginTop: '4px' }}>
                  <span>Est. Annual Savings: {item.annualSavings} kg CO₂e</span>
                </div>
              </div>

              <button
                onClick={() => onToggleCommit(item.id)}
                className={`btn ${isCommitted ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}
                aria-label={isCommitted ? `Cancel commitment to ${item.title}` : `Commit to ${item.title}`}
              >
                {isCommitted ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
                <span>{isCommitted ? 'Committed' : 'Commit'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Secondary Insights list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ textAlign: 'left', fontSize: '1rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px' }}>
          Other helpful opportunities
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {secondarySuggestions.slice(0, 3).map(item => {
            const isCommitted = committedActionIds.includes(item.id);
            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  border: `1px solid ${isCommitted ? 'var(--primary)' : 'var(--card-border)'}`,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isCommitted ? 'var(--primary-bg)' : 'var(--card-bg)',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>{item.title}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {getCategoryLabel(item.category)} • Saves ~{item.annualSavings} kg/yr
                  </span>
                </div>

                <button
                  onClick={() => onToggleCommit(item.id)}
                  className={`btn ${isCommitted ? 'btn-primary' : 'btn-outline'}`}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    borderRadius: 'var(--radius-round)',
                    height: 'fit-content'
                  }}
                  aria-label={isCommitted ? `Cancel commitment to ${item.title}` : `Commit to ${item.title}`}
                >
                  {isCommitted ? <Check size={12} aria-hidden="true" /> : <Plus size={12} aria-hidden="true" />}
                  <span>{isCommitted ? 'Added' : 'Add'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
