import React, { useState, useEffect } from 'react';
import type { ActionItem } from './InsightsPanel';
import { Calendar, Trash2, TrendingDown, Sparkles } from 'lucide-react';

interface DailyLog {
  date: string; // YYYY-MM-DD
  actions: string[];
  totalSavings: number; // in kg CO2e
}

interface ActionTrackerProps {
  originalFootprint: number; // in kg CO2e
  committedActionIds: string[];
}

// Built-in daily actions that are always available
const BASE_DAILY_ACTIONS: ActionItem[] = [
  {
    id: 'plant_meal',
    category: 'diet',
    title: 'Ate Fully Plant-Based today',
    impactText: 'Medium Impact',
    description: 'Swapped all meals today for vegan alternatives, avoiding meat and dairy products.',
    annualSavings: 500,
    dailySavings: 3.5
  },
  {
    id: 'public_transit',
    category: 'transport',
    title: 'Took Public Transport or Biked',
    impactText: 'High Impact',
    description: 'Walked, bicycled, carpooled, or took the bus/train instead of driving a personal gas car.',
    annualSavings: 450,
    dailySavings: 4.2
  },
  {
    id: 'line_dry',
    category: 'energy',
    title: 'Line-Dried a Load of Laundry',
    impactText: 'Low Impact',
    description: 'Air-dried clothes on a line or drying rack instead of running the electric dryer.',
    annualSavings: 120,
    dailySavings: 1.5
  },
  {
    id: 'unplug_vampire',
    category: 'energy',
    title: 'Turned off Vampire Power',
    impactText: 'Low Impact',
    description: 'Unplugged chargers, television stands, and computer equipment when not in use today.',
    annualSavings: 50,
    dailySavings: 0.3
  },
  {
    id: 'zero_waste_day',
    category: 'waste',
    title: 'Zero Single-Use Plastic Day',
    impactText: 'Low Impact',
    description: 'Avoided buying items packaged in single-use plastic, and used reusable containers and cups.',
    annualSavings: 60,
    dailySavings: 0.5
  }
];

// Combine base actions with dynamic ones committed by user in InsightsPanel
const ALL_AVAILABLE_ACTIONS = [
  ...BASE_DAILY_ACTIONS,
  // Fetch from all suggestions if committed
  {
    id: 'transit_swap',
    category: 'transport',
    title: 'Swapped Car for Transit',
    impactText: 'High Impact',
    description: 'Commuted via bus or rail instead of driving.',
    annualSavings: 150,
    dailySavings: 3.0
  },
  {
    id: 'flight_reduction',
    category: 'transport',
    title: 'Opted for Train over Flight',
    impactText: 'Critical Impact',
    description: 'Avoided taking a flight for travel.',
    annualSavings: 350,
    dailySavings: 30.0
  },
  {
    id: 'eco_driving',
    category: 'transport',
    title: 'Maintained Eco-Driving Habit',
    impactText: 'Medium Impact',
    description: 'Drove fuel-efficiently, checking tires and acceleration.',
    annualSavings: 80,
    dailySavings: 0.3
  },
  {
    id: 'green_tariff',
    category: 'energy',
    title: 'Household Runs on Renewable Power',
    impactText: 'Critical Impact',
    description: 'Switched utility billing to wind/solar sources.',
    annualSavings: 800,
    dailySavings: 2.2
  },
  {
    id: 'thermostat_down',
    category: 'energy',
    title: 'Lowered Thermostat by 1°C',
    impactText: 'High Impact',
    description: 'Adjusted indoor heating to reduce gas consumption.',
    annualSavings: 140,
    dailySavings: 0.8
  },
  {
    id: 'cold_wash_dry',
    category: 'energy',
    title: 'Washed Cold and Line Dried',
    impactText: 'Medium Impact',
    description: 'Laundered on cold and avoided mechanical drying.',
    annualSavings: 110,
    dailySavings: 1.5
  },
  {
    id: 'veggie_day',
    category: 'diet',
    title: 'Had a plant-based day',
    impactText: 'High Impact',
    description: 'Ate purely vegetarian/vegan options today.',
    annualSavings: 200,
    dailySavings: 3.8
  },
  {
    id: 'local_organic',
    category: 'diet',
    title: 'Ate local & seasonal food',
    impactText: 'Medium Impact',
    description: 'Chose locally sourced seasonal vegetables.',
    annualSavings: 120,
    dailySavings: 0.5
  },
  {
    id: 'zero_food_waste',
    category: 'diet',
    title: 'Zero Food Waste Day',
    impactText: 'Medium Impact',
    description: 'Composted and finished all household meals.',
    annualSavings: 150,
    dailySavings: 0.8
  },
  {
    id: 'secondhand_first',
    category: 'waste',
    title: 'Bought Secondhand Item',
    impactText: 'High Impact',
    description: 'Bought pre-owned clothing or gadgets.',
    annualSavings: 250,
    dailySavings: 5.0
  },
  {
    id: 'plastic_free',
    category: 'waste',
    title: 'Avoided Plastic Waste Today',
    impactText: 'Medium Impact',
    description: 'Used reusable containers and shopping bags.',
    annualSavings: 60,
    dailySavings: 0.2
  },
  {
    id: 'recycle_electronics',
    category: 'waste',
    title: 'Composted or Sorted Waste',
    impactText: 'Medium Impact',
    description: 'Sorted aluminum, plastic, paper, and compost.',
    annualSavings: 150,
    dailySavings: 0.4
  }
] as const;

export const ActionTracker: React.FC<ActionTrackerProps> = ({ originalFootprint, committedActionIds }) => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [logSuccessMessage, setLogSuccessMessage] = useState<string>('');

  useEffect(() => {
    // Set default date to today in user's local timezone (YYYY-MM-DD)
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    setCurrentDate(localToday.toISOString().split('T')[0]);

    // Load logs from localStorage
    const savedLogs = localStorage.getItem('carbon_tracker_daily_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error('Error parsing daily logs', e);
      }
    }
  }, []);

  // Filter actions to show basic daily actions PLUS committed ones
  const activeActions = ALL_AVAILABLE_ACTIONS.filter(action => {
    // Show if it is a base action OR if it is in the user's committed IDs
    const isBase = BASE_DAILY_ACTIONS.some(b => b.id === action.id);
    const isCommitted = committedActionIds.includes(action.id);
    return isBase || isCommitted;
  });

  // Unique actions list (removing duplicate objects that might overlap)
  const uniqueActiveActions = activeActions.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

  const handleToggleAction = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleLogDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDate) return;

    // Calculate savings for checked actions
    const savings = selectedActions.reduce((total, actionId) => {
      const act = uniqueActiveActions.find(a => a.id === actionId);
      return total + (act ? act.dailySavings : 0);
    }, 0);

    const roundedSavings = Math.round(savings * 10) / 10; // round to 1 decimal place

    const newLog: DailyLog = {
      date: currentDate,
      actions: [...selectedActions],
      totalSavings: roundedSavings
    };

    // Update logs list, replacing any existing entry for that date
    const updatedLogs = logs.filter(l => l.date !== currentDate);
    updatedLogs.push(newLog);
    // Sort logs by date descending
    updatedLogs.sort((a, b) => b.date.localeCompare(a.date));

    setLogs(updatedLogs);
    localStorage.setItem('carbon_tracker_daily_logs', JSON.stringify(updatedLogs));

    // Clear selection and show flash message
    setSelectedActions([]);
    setLogSuccessMessage(`Logged! You saved ${roundedSavings} kg CO₂e on this day.`);
    
    // Clear success message after 4s
    setTimeout(() => {
      setLogSuccessMessage('');
    }, 4000);
  };

  const handleDeleteLog = (dateToDelete: string) => {
    const updated = logs.filter(l => l.date !== dateToDelete);
    setLogs(updated);
    localStorage.setItem('carbon_tracker_daily_logs', JSON.stringify(updated));
  };

  // Calculate stats
  const totalSavedAllTime = logs.reduce((sum, l) => sum + l.totalSavings, 0);
  const averageDailySavings = logs.length > 0 ? (totalSavedAllTime / logs.length) : 0;
  
  // Projected annual footprint reduction
  const projectedAnnualSavings = Math.round(averageDailySavings * 365);
  const newProjectedFootprint = Math.max(0, originalFootprint - projectedAnnualSavings);

  // Generate 7-day trend chart data
  const getLast7Days = () => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const matchLog = logs.find(l => l.date === dateStr);
      
      // Label formatted as Mon 14, Tue 15, etc.
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      result.push({
        date: dateStr,
        label,
        savings: matchLog ? matchLog.totalSavings : 0
      });
    }
    return result;
  };

  const chartData = getLast7Days();
  const maxSavingsInChart = Math.max(...chartData.map(d => d.savings), 5); // minimum ceiling of 5 for scaling

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Projection Card */}
      <section 
        className="card glass" 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
          border: '1px solid var(--primary-light)'
        }}
        aria-label="Progress Projections"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-dark)' }}>
          <TrendingDown size={24} aria-hidden="true" />
          <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Progress Projection</h2>
        </div>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
          By consistently logging and performing eco-actions, you reduce your footprint over time. Here is your projected impact:
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          width: '100%',
          flexWrap: 'wrap',
          marginTop: '8px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-sm)',
            minWidth: '160px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Original Profile
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>
              {(originalFootprint / 1000).toFixed(1)} tons
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CO₂e / year</span>
          </div>

          <div style={{
            fontSize: '2rem',
            color: 'var(--primary-light)',
            fontWeight: 700
          }} aria-hidden="true">
            →
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'var(--primary-bg)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            minWidth: '160px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', textTransform: 'uppercase', fontWeight: 700 }}>
              Projected Annual
            </span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {(newProjectedFootprint / 1000).toFixed(1)} tons
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>with daily actions</span>
          </div>
        </div>

        {logs.length > 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: 'var(--primary-dark)',
            backgroundColor: 'var(--primary-bg)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-round)',
            fontWeight: 600
          }}>
            <Sparkles size={16} aria-hidden="true" />
            <span>You have logged {logs.length} day(s), saving an average of {averageDailySavings.toFixed(1)} kg CO₂e / day!</span>
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600 }}>
            Log your first daily actions below to start projecting your reduction!
          </p>
        )}
      </section>

      {/* Grid: Daily Logger vs Trend Chart */}
      <div className="dashboard-grid">
        
        {/* Daily Eco-Action Log Form */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)' }}>Log Eco-Actions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select the sustainable choices you made on this day.
            </p>
          </div>

          {logSuccessMessage && (
            <div 
              style={{
                backgroundColor: 'var(--primary-bg)',
                border: '1px solid var(--primary-light)',
                color: 'var(--primary-dark)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 600,
                textAlign: 'left'
              }}
              role="alert"
            >
              {logSuccessMessage}
            </div>
          )}

          <form onSubmit={handleLogDay} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="logDate" className="form-label">Select Date</label>
              <input
                id="logDate"
                type="date"
                className="form-control"
                style={{ maxWidth: '240px' }}
                value={currentDate}
                onChange={e => setCurrentDate(e.target.value)}
                required
              />
            </div>

            <fieldset style={{ border: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <legend style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '8px', textAlign: 'left' }}>
                Your Actions Checklist
              </legend>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uniqueActiveActions.map(action => {
                  const isChecked = selectedActions.includes(action.id);
                  return (
                    <label
                      key={action.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px',
                        border: '1px solid var(--card-border)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isChecked ? 'var(--primary-bg)' : 'var(--card-bg)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAction(action.id)}
                        style={{
                          marginTop: '4px',
                          accentColor: 'var(--primary)',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text)' }}>
                          {action.title}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {action.description}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600, marginTop: '2px' }}>
                          Saves ~{action.dailySavings} kg CO₂e
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={selectedActions.length === 0}
            >
              Log Today's Savings
            </button>
          </form>
        </section>

        {/* 7-Day Trend SVG Chart */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary-dark)' }}>Weekly Savings Trend</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Your logged CO₂e savings over the last 7 days.
            </p>
          </div>

          {/* Simple Accessible SVG Bar Chart */}
          <div style={{ width: '100%', overflow: 'visible' }}>
            <svg 
              viewBox="0 0 400 240" 
              style={{ width: '100%', height: 'auto', overflow: 'visible' }}
              role="img"
              aria-label="7-day carbon savings chart. Shows savings per day in kg."
            >
              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(pct => {
                const y = 30 + (160 * (100 - pct)) / 100;
                const valueLabel = Math.round((maxSavingsInChart * pct) / 100);
                return (
                  <g key={pct}>
                    <line 
                      x1="45" 
                      y1={y} 
                      x2="385" 
                      y2={y} 
                      stroke="var(--card-border)" 
                      strokeWidth="1" 
                      strokeDasharray="4,4" 
                    />
                    <text 
                      x="35" 
                      y={y + 4} 
                      fill="var(--text-muted)" 
                      fontSize="10" 
                      textAnchor="end"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chartData.map((d, index) => {
                const barWidth = 28;
                const gap = 20;
                const x = 55 + index * (barWidth + gap);
                const height = maxSavingsInChart > 0 ? (d.savings / maxSavingsInChart) * 160 : 0;
                const y = 190 - height;
                const barRadius = 4;

                return (
                  <g key={d.date} tabIndex={0} role="graphics-symbol" aria-label={`${d.label}: saved ${d.savings} kg CO2`}>
                    {/* Background track */}
                    <rect
                      x={x}
                      y="30"
                      width={barWidth}
                      height="160"
                      fill="var(--secondary-bg)"
                      opacity="0.3"
                      rx={barRadius}
                    />
                    {/* Active savings bar */}
                    {d.savings > 0 && (
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        fill="var(--primary-light)"
                        rx={barRadius}
                        style={{ transition: 'all 0.5s ease' }}
                      />
                    )}
                    {/* X-axis label */}
                    <text
                      x={x + barWidth / 2}
                      y="208"
                      fill="var(--text-muted)"
                      fontSize="9"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {d.label.split(' ')[0]}
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y="220"
                      fill="var(--text-muted)"
                      fontSize="9"
                      fontWeight="500"
                      textAnchor="middle"
                    >
                      {d.label.split(' ')[1]}
                    </text>
                    {/* Hover/Focus value tag */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      fill="var(--primary-dark)"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      opacity={d.savings > 0 ? 1 : 0}
                    >
                      {d.savings}
                    </text>
                  </g>
                );
              })}
              {/* Bottom Baseline */}
              <line x1="45" y1="190" x2="385" y2="190" stroke="var(--card-border)" strokeWidth="2" />
            </svg>
          </div>
        </section>
      </div>

      {/* History Log list */}
      {logs.length > 0 && (
        <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" aria-hidden="true" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-dark)', margin: 0 }}>Action History Log</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} role="log">
            {logs.map(log => {
              const formattedDate = new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <div 
                  key={log.date}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>
                      {formattedDate}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                      {log.actions.map(actId => {
                        const act = ALL_AVAILABLE_ACTIONS.find(a => a.id === actId);
                        return (
                          <span 
                            key={actId} 
                            style={{
                              fontSize: '0.72rem',
                              backgroundColor: 'var(--card-bg)',
                              border: '1px solid var(--card-border)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-round)',
                              color: 'var(--text-muted)'
                            }}
                          >
                            {act ? act.title : actId}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-dark)' }}>
                      -{log.totalSavings} kg
                    </span>
                    <button
                      onClick={() => handleDeleteLog(log.date)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                      aria-label={`Delete log for ${formattedDate}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
};
