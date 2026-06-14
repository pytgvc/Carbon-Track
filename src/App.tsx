import { useState, useEffect } from 'react';
import { OnboardingForm } from './components/OnboardingForm';
import { Dashboard } from './components/Dashboard';
import { InsightsPanel } from './components/InsightsPanel';
import { ActionTracker } from './components/ActionTracker';
import { ErrorBoundary } from './components/ErrorBoundary';
import { calculateFootprint } from './utils/calculator';
import type { UserLifestyleData, EmissionsBreakdown } from './utils/calculator';
import { Leaf, Calendar, BarChart2 } from 'lucide-react';

function App() {
  const [userData, setUserData] = useState<UserLifestyleData | null>(null);
  const [committedActionIds, setCommittedActionIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read state from localStorage on load
    const savedProfile = localStorage.getItem('carbon_tracker_user_profile');
    const savedCommits = localStorage.getItem('carbon_tracker_committed_actions');

    if (savedProfile) {
      try {
        setUserData(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error parsing user profile from localStorage', e);
      }
    }

    if (savedCommits) {
      try {
        setCommittedActionIds(JSON.parse(savedCommits));
      } catch (e) {
        console.error('Error parsing committed actions from localStorage', e);
      }
    }

    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = (data: UserLifestyleData) => {
    setUserData(data);
    localStorage.setItem('carbon_tracker_user_profile', JSON.stringify(data));
  };

  const handleResetProfile = () => {
    if (window.confirm('Are you sure you want to reset your profile? This will clear your current inputs, but keep your daily progress logs.')) {
      setUserData(null);
      localStorage.removeItem('carbon_tracker_user_profile');
      setActiveTab('dashboard');
    }
  };

  const handleToggleCommit = (actionId: string) => {
    const updated = committedActionIds.includes(actionId)
      ? committedActionIds.filter(id => id !== actionId)
      : [...committedActionIds, actionId];

    setCommittedActionIds(updated);
    localStorage.setItem('carbon_tracker_committed_actions', JSON.stringify(updated));
  };

  if (isLoading) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg)',
          color: 'var(--primary)'
        }}
        role="status"
        aria-live="polite"
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Leaf className="animate-pulse" size={48} style={{ animation: 'spin 4s linear infinite' }} />
          <span style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Loading Carbon Tracker...</span>
        </div>
      </div>
    );
  }

  // Calculate footprint details if profile is loaded
  const footprintBreakdown: EmissionsBreakdown | null = userData ? calculateFootprint(userData) : null;

  return (
    <ErrorBoundary>
      {/* WCAG Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navigation Header */}
        <header 
          style={{
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)',
            padding: '16px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--primary)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Leaf size={24} aria-hidden="true" />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.3rem',
                color: 'var(--primary-dark)',
                letterSpacing: '-0.5px'
              }}>
                EcoTrace
              </span>
            </div>

            {/* Tab switch navigation (only shown if onboarded) */}
            {userData && (
              <nav aria-label="Main Navigation" style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    borderRadius: 'var(--radius-round)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  aria-current={activeTab === 'dashboard' ? 'page' : undefined}
                >
                  <BarChart2 size={16} aria-hidden="true" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('tracker')}
                  className={`btn ${activeTab === 'tracker' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.88rem',
                    borderRadius: 'var(--radius-round)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  aria-current={activeTab === 'tracker' ? 'page' : undefined}
                >
                  <Calendar size={16} aria-hidden="true" />
                  <span>Daily Tracker</span>
                </button>
              </nav>
            )}

          </div>
        </header>

        {/* Main Content Area */}
        <main 
          id="main-content" 
          className="container" 
          style={{ flex: 1, paddingTop: '32px', paddingBottom: '48px', position: 'relative' }}
        >
          {!userData ? (
            // User needs to fill out lifestyle questions
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ maxWidth: '600px', margin: '0 auto 24px auto' }}>
                <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--primary-dark)', marginBottom: '12px' }}>
                  Understand your climate impact.
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                  Take a quick, 3-minute lifestyle audit to calculate your annual carbon footprint. Get tailored, simple daily suggestions to reduce your footprint over time.
                </p>
              </div>
              <OnboardingForm onComplete={handleOnboardingComplete} />
            </div>
          ) : (
            // Onboarded view
            <div className="animate-fade-in">
              {activeTab === 'dashboard' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <Dashboard 
                    breakdown={footprintBreakdown!} 
                    onReset={handleResetProfile} 
                  />
                  <InsightsPanel 
                    breakdown={footprintBreakdown!} 
                    committedActionIds={committedActionIds}
                    onToggleCommit={handleToggleCommit}
                  />
                </div>
              ) : (
                <ActionTracker 
                  originalFootprint={footprintBreakdown!.total} 
                  committedActionIds={committedActionIds}
                />
              )}
            </div>
          )}
        </main>

        {/* Accessible Footer */}
        <footer 
          style={{
            backgroundColor: 'var(--card-bg)',
            borderTop: '1px solid var(--card-border)',
            padding: '24px 0',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}
        >
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontWeight: 600 }}>
              <Leaf size={16} aria-hidden="true" />
              <span>EcoTrace Carbon Tracker</span>
            </div>
            <p>Calculations based on international climate emission factor databases.</p>
            <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              © {new Date().getFullYear()} EcoTrace. Designed for sustainable futures. No personal data is collected or sent to servers.
            </p>
          </div>
        </footer>

      </div>
    </ErrorBoundary>
  );
}

export default App;
