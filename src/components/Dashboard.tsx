import React from 'react';
import { CO2_BENCHMARKS } from '../utils/calculator';
import type { EmissionsBreakdown } from '../utils/calculator';
import { Car, Zap, Utensils, ShoppingBag, RotateCcw, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

interface DashboardProps {
  breakdown: EmissionsBreakdown;
  onReset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ breakdown, onReset }) => {
  const { total, transport, energy, diet, waste } = breakdown;

  // Determine user rating tier
  let tierLabel = 'Above Average';
  let tierColor = 'var(--danger)';
  let tierBg = 'badge-danger';
  let tierIcon = <AlertTriangle size={18} aria-hidden="true" />;
  let feedbackText = 'Your annual footprint is high. Try focusing on your top emission sectors to make a difference.';

  if (total <= CO2_BENCHMARKS.climateTarget) {
    tierLabel = 'Climate Hero';
    tierColor = 'var(--primary)';
    tierBg = 'badge-success';
    tierIcon = <CheckCircle size={18} aria-hidden="true" />;
    feedbackText = 'Incredible! Your carbon footprint aligns with the Paris Agreement targets to limit global warming.';
  } else if (total <= CO2_BENCHMARKS.globalAverage) {
    tierLabel = 'Sustainable Living';
    tierColor = 'var(--secondary)';
    tierBg = 'badge-success';
    tierIcon = <CheckCircle size={18} aria-hidden="true" />;
    feedbackText = 'Well done! You are below the global average. Explore our insights panel to reduce your footprint even more.';
  } else if (total <= CO2_BENCHMARKS.euAverage) {
    tierLabel = 'Average Impact';
    tierColor = 'var(--accent)';
    tierBg = 'badge-warning';
    tierIcon = <HelpCircle size={18} aria-hidden="true" />;
    feedbackText = 'Your carbon footprint is around average for European countries. There are many small actions that can help.';
  }

  // Calculate percentages
  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  const categories = [
    {
      id: 'transport',
      label: 'Transportation',
      value: transport,
      pct: getPercentage(transport),
      color: 'hsl(142, 60%, 35%)',
      icon: <Car size={20} aria-hidden="true" />,
      description: 'Vehicle emissions & air travel'
    },
    {
      id: 'energy',
      label: 'Home Energy',
      value: energy,
      pct: getPercentage(energy),
      color: 'hsl(38, 92%, 40%)',
      icon: <Zap size={20} aria-hidden="true" />,
      description: 'Electricity & heating fuel'
    },
    {
      id: 'diet',
      label: 'Dietary Choices',
      value: diet,
      pct: getPercentage(diet),
      color: 'hsl(155, 35%, 45%)',
      icon: <Utensils size={20} aria-hidden="true" />,
      description: 'Food production carbon intensity'
    },
    {
      id: 'waste',
      label: 'Shopping & Waste',
      value: waste,
      pct: getPercentage(waste),
      color: 'hsl(200, 45%, 45%)',
      icon: <ShoppingBag size={20} aria-hidden="true" />,
      description: 'Consumption footprint & recycling'
    }
  ];

  // Benchmark metrics for visual chart comparisons
  const benchmarkValues = [
    { label: 'Paris Target', value: CO2_BENCHMARKS.climateTarget, color: 'var(--primary)' },
    { label: 'You', value: total, color: tierColor, isUser: true },
    { label: 'Global Avg', value: CO2_BENCHMARKS.globalAverage, color: 'var(--text-muted)' },
    { label: 'EU Average', value: CO2_BENCHMARKS.euAverage, color: 'var(--text-muted)' },
    { label: 'US Average', value: CO2_BENCHMARKS.usAverage, color: 'var(--text-muted)' }
  ].sort((a, b) => a.value - b.value);

  const maxBenchmark = Math.max(...benchmarkValues.map(v => v.value));

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Score Display */}
      <section 
        className="card glass" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          padding: '32px'
        }}
        aria-label="Overall Carbon Summary"
      >
        <div className={`badge ${tierBg}`} style={{ display: 'flex', gap: '8px', padding: '6px 16px' }}>
          {tierIcon}
          <span>{tierLabel}</span>
        </div>

        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
            Your Carbon Footprint
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '4rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--primary-dark)',
              lineHeight: 1
            }}>
              {(total / 1000).toFixed(1)}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              tons CO₂e / year
            </span>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Total: <strong>{total.toLocaleString()}</strong> kg CO₂e per year
          </p>
        </div>

        <p style={{ maxWidth: '600px', fontSize: '1rem', color: 'var(--text)', lineHeight: 1.5 }}>
          {feedbackText}
        </p>

        <button 
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.85rem', marginTop: '8px' }}
          aria-label="Recalculate your carbon footprint profile"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>Retake Questionnaire</span>
        </button>
      </section>

      {/* Grid: Breakdown vs Benchmarks */}
      <div className="dashboard-grid">
        
        {/* Category Breakdown */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)' }}>Emissions by Category</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Where your environmental impact comes from.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} role="list" aria-label="Category emissions list">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                role="listitem"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg)',
                  border: '1px solid var(--card-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--card-bg)',
                      color: cat.color,
                      border: '1px solid var(--card-border)'
                    }}>
                      {cat.icon}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>
                        {cat.label}
                      </span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.description}</p>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>
                      {cat.value.toLocaleString()} kg
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({cat.pct}%)
                    </span>
                  </div>
                </div>

                <div 
                  className="progress-bar-container" 
                  aria-label={`${cat.label} contributes ${cat.pct}% of total footprint`}
                  role="progressbar"
                  aria-valuenow={cat.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${cat.pct}%`, 
                      backgroundColor: cat.color 
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benchmarks Comparison */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)' }}>How You Compare</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your emissions relative to global standards.
            </p>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              padding: '8px 0'
            }}
            aria-label="Comparison chart"
          >
            {benchmarkValues.map((bench, idx) => {
              const widthPct = Math.max(5, (bench.value / maxBenchmark) * 100);
              return (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ 
                      fontWeight: bench.isUser ? 700 : 500,
                      color: bench.isUser ? 'var(--primary-dark)' : 'var(--text)' 
                    }}>
                      {bench.label} {bench.isUser && ' (You)'}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {(bench.value / 1000).toFixed(1)} tons
                    </span>
                  </div>
                  
                  <div style={{ 
                    height: '24px', 
                    width: '100%', 
                    backgroundColor: 'var(--secondary-bg)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: bench.isUser ? '1px solid var(--primary-light)' : 'none'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${widthPct}%`,
                      backgroundColor: bench.isUser ? 'var(--primary-light)' : 'var(--card-border)',
                      opacity: bench.isUser ? 1 : 0.8,
                      borderRadius: '4px',
                      transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }} />
                    {bench.label === 'Paris Target' && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${(CO2_BENCHMARKS.climateTarget / maxBenchmark) * 100}%`,
                        width: '2px',
                        backgroundColor: 'var(--primary)',
                        zIndex: 3
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: 'var(--primary-bg)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            textAlign: 'left',
            lineHeight: 1.4,
            color: 'var(--primary-dark)',
            borderLeft: '4px solid var(--primary)'
          }}>
            <strong>Paris Target:</strong> A carbon footprint of less than 2.0 tons per person annually is recommended to limit global heating to 1.5°C.
          </div>
        </section>

      </div>
    </div>
  );
};
