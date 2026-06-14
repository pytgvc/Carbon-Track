import React, { useState, useRef, useEffect } from 'react';
import type { UserLifestyleData, CarType, HeatingType, DietType, LocalOrganicPref, ShoppingHabit, RecyclingHabit } from '../utils/calculator';
import { Info, Leaf, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingFormProps {
  onComplete: (data: UserLifestyleData) => void;
}

const DEFAULT_DATA: UserLifestyleData = {
  carDistance: 100,
  carType: 'petrol',
  transitDistance: 30,
  flightHours: 5,
  electricityKwh: 250,
  greenEnergyPct: 0,
  heatingType: 'gas',
  householdSize: 2,
  dietType: 'average-meat',
  localOrganicPref: 'average',
  shoppingHabit: 'average',
  recyclingHabit: 'some'
};

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserLifestyleData>(DEFAULT_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ariaAnnounce, setAriaAnnounce] = useState('');
  
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Announce step change to screen readers and set focus
  useEffect(() => {
    const stepTitles = [
      '',
      'Step 1: Household and Community',
      'Step 2: Getting Around (Transportation)',
      'Step 3: Energy in Your Home',
      'Step 4: Diet and Shopping Habits'
    ];
    setAriaAnnounce(`Navigated to ${stepTitles[step]}.`);
    
    // Move focus to step header for keyboard users
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [step]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (formData.householdSize < 1) {
        newErrors.householdSize = 'Household size must be at least 1 person.';
      }
    } else if (currentStep === 2) {
      if (formData.carDistance < 0) {
        newErrors.carDistance = 'Driving distance cannot be negative.';
      }
      if (formData.transitDistance < 0) {
        newErrors.transitDistance = 'Transit distance cannot be negative.';
      }
      if (formData.flightHours < 0) {
        newErrors.flightHours = 'Flight hours cannot be negative.';
      }
    } else if (currentStep === 3) {
      if (formData.electricityKwh < 0) {
        newErrors.electricityKwh = 'Electricity usage cannot be negative.';
      }
      if (formData.greenEnergyPct < 0 || formData.greenEnergyPct > 100) {
        newErrors.greenEnergyPct = 'Green energy percentage must be between 0 and 100.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(step)) {
      if (step < 4) {
        setStep(prev => prev + 1);
      } else {
        onComplete(formData);
      }
    } else {
      setAriaAnnounce('Form has validation errors. Please review the inputs.');
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setErrors({});
    }
  };

  const updateField = <K extends keyof UserLifestyleData>(field: K, value: UserLifestyleData[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear field-specific error as they type
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="card glass animate-fade-in" style={{ maxWidth: '650px', margin: '40px auto' }}>
      
      {/* Hidden screen reader live region */}
      <div className="sr-only" aria-live="polite" role="status">
        {ariaAnnounce}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        <Leaf aria-hidden="true" size={32} color="var(--primary)" />
        <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--primary-dark)' }}>Calculate Your Footprint</h1>
      </div>

      {/* Progress Indicators */}
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}
        aria-label="Progress tracker"
      >
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '10px',
          right: '10px',
          height: '2px',
          backgroundColor: 'var(--card-border)',
          zIndex: 1
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--primary)',
            width: `${((step - 1) / 3) * 100}%`,
            transition: 'width 0.3s ease'
          }} />
        </div>

        {[1, 2, 3, 4].map(num => (
          <button
            key={num}
            onClick={() => {
              if (num < step || validateStep(step)) {
                setStep(num);
              }
            }}
            disabled={num > step && !validateStep(step)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: num <= step ? 'var(--primary)' : 'var(--card-bg)',
              color: num <= step ? '#ffffff' : 'var(--text-muted)',
              border: `2px solid ${num <= step ? 'var(--primary)' : 'var(--card-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              zIndex: 2,
              cursor: (num < step || validateStep(step)) ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
            aria-label={`Go to step ${num}`}
            aria-current={step === num ? 'step' : undefined}
          >
            {num < step ? <Check size={16} aria-hidden="true" /> : num}
          </button>
        ))}
      </div>

      <form onSubmit={handleNext} noValidate>
        {/* Step 1: Household and Community */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: '1.4rem', marginBottom: '8px' }}>
                Household Details
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Let's start with your living situation. Carbon emissions are shared in households.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="householdSize" className="form-label">
                How many people live in your home? <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="householdSize"
                type="number"
                min="1"
                className="form-control"
                value={formData.householdSize}
                onChange={e => updateField('householdSize', parseInt(e.target.value) || 1)}
                aria-invalid={!!errors.householdSize}
                aria-describedby={errors.householdSize ? 'householdSize-error' : 'householdSize-desc'}
              />
              <span id="householdSize-desc" className="form-desc">
                We share household energy and waste footprints between all members.
              </span>
              {errors.householdSize && (
                <span id="householdSize-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {errors.householdSize}
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              backgroundColor: 'var(--primary-bg)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              borderLeft: '4px solid var(--primary-light)',
              textAlign: 'left'
            }}>
              <Info color="var(--primary)" size={24} style={{ flexShrink: 0 }} aria-hidden="true" />
              <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                <strong>Did you know?</strong> An average individual in a 2-person household shares major base heating and lighting loads, reducing individual footprints by up to 30%.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Transportation */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: '1.4rem', marginBottom: '8px' }}>
                Transportation & Travel
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                How do you get around in an average week, and what flights do you take?
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" id="carType-label">
                What type of car do you drive most often?
              </label>
              <div className="radio-cards" role="radiogroup" aria-labelledby="carType-label">
                {[
                  { value: 'petrol', title: 'Petrol', desc: 'Gasoline engine' },
                  { value: 'diesel', title: 'Diesel', desc: 'Diesel fuel' },
                  { value: 'hybrid', title: 'Hybrid', desc: 'Petrol-Electric hybrid' },
                  { value: 'electric', title: 'Electric', desc: 'Battery EV' },
                  { value: 'none', title: 'No Car', desc: 'Do not drive' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-card ${formData.carType === opt.value ? 'selected' : ''}`}
                    onClick={() => updateField('carType', opt.value as CarType)}
                    role="radio"
                    aria-checked={formData.carType === opt.value}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        updateField('carType', opt.value as CarType);
                      }
                    }}
                  >
                    <span className="radio-card-title">{opt.title}</span>
                    <span className="radio-card-desc">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {formData.carType !== 'none' && (
              <div className="form-group">
                <label htmlFor="carDistance" className="form-label">
                  Average driving distance (km per week)
                </label>
                <input
                  id="carDistance"
                  type="number"
                  min="0"
                  className="form-control"
                  value={formData.carDistance}
                  onChange={e => updateField('carDistance', parseFloat(e.target.value) || 0)}
                  aria-invalid={!!errors.carDistance}
                  aria-describedby={errors.carDistance ? 'carDistance-error' : undefined}
                />
                {errors.carDistance && (
                  <span id="carDistance-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {errors.carDistance}
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="transitDistance" className="form-label">
                Public transport travel (bus, train, subway - km per week)
              </label>
              <input
                id="transitDistance"
                type="number"
                min="0"
                className="form-control"
                value={formData.transitDistance}
                onChange={e => updateField('transitDistance', parseFloat(e.target.value) || 0)}
                aria-invalid={!!errors.transitDistance}
                aria-describedby={errors.transitDistance ? 'transitDistance-error' : undefined}
              />
              {errors.transitDistance && (
                <span id="transitDistance-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {errors.transitDistance}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="flightHours" className="form-label">
                Total flight time (hours per year)
              </label>
              <input
                id="flightHours"
                type="number"
                min="0"
                className="form-control"
                value={formData.flightHours}
                onChange={e => updateField('flightHours', parseFloat(e.target.value) || 0)}
                aria-invalid={!!errors.flightHours}
                aria-describedby={errors.flightHours ? 'flightHours-error' : 'flightHours-desc'}
              />
              <span id="flightHours-desc" className="form-desc">
                Includes short-haul and long-haul flights combined (e.g. London to Paris is ~1hr; New York to London is ~7hr).
              </span>
              {errors.flightHours && (
                <span id="flightHours-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {errors.flightHours}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Household Energy */}
        {step === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: '1.4rem', marginBottom: '8px' }}>
                Household Utilities
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                How much power and heating fuel does your household consume?
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="electricityKwh" className="form-label">
                Monthly electricity consumption (kWh)
              </label>
              <input
                id="electricityKwh"
                type="number"
                min="0"
                className="form-control"
                value={formData.electricityKwh}
                onChange={e => updateField('electricityKwh', parseFloat(e.target.value) || 0)}
                aria-invalid={!!errors.electricityKwh}
                aria-describedby={errors.electricityKwh ? 'electricityKwh-error' : 'electricityKwh-desc'}
              />
              <span id="electricityKwh-desc" className="form-desc">
                Check your electric bill or estimate (average apartment is ~200 kWh, family home ~400 kWh).
              </span>
              {errors.electricityKwh && (
                <span id="electricityKwh-error" style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {errors.electricityKwh}
                </span>
              )}
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="greenEnergyPct" className="form-label">
                  Green energy tariff percentage: <strong>{formData.greenEnergyPct}%</strong>
                </label>
              </div>
              <input
                id="greenEnergyPct"
                type="range"
                min="0"
                max="100"
                step="10"
                style={{
                  accentColor: 'var(--primary)',
                  width: '100%',
                  height: '6px',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
                value={formData.greenEnergyPct}
                onChange={e => updateField('greenEnergyPct', parseInt(e.target.value) || 0)}
                aria-describedby="greenEnergyPct-desc"
              />
              <span id="greenEnergyPct-desc" className="form-desc">
                Percentage of your electricity sourced from certified solar, wind, or hydro.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" id="heatingType-label">
                Primary heating source
              </label>
              <div className="radio-cards" role="radiogroup" aria-labelledby="heatingType-label">
                {[
                  { value: 'gas', title: 'Natural Gas', desc: 'Boiler heating' },
                  { value: 'oil', title: 'Heating Oil', desc: 'Fuel oil tank' },
                  { value: 'heatpump', title: 'Heat Pump', desc: 'Electric heat pump' },
                  { value: 'biomass', title: 'Biomass/Wood', desc: 'Wood pellets' },
                  { value: 'none', title: 'No Heating', desc: 'Or passive solar' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-card ${formData.heatingType === opt.value ? 'selected' : ''}`}
                    onClick={() => updateField('heatingType', opt.value as HeatingType)}
                    role="radio"
                    aria-checked={formData.heatingType === opt.value}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        updateField('heatingType', opt.value as HeatingType);
                      }
                    }}
                  >
                    <span className="radio-card-title">{opt.title}</span>
                    <span className="radio-card-desc">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Diet & Habits */}
        {step === 4 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 ref={headingRef} tabIndex={-1} style={{ outline: 'none', fontSize: '1.4rem', marginBottom: '8px' }}>
                Diet & Consumption
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Your food and purchasing choices represent a significant part of your environmental footprint.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" id="dietType-label">
                Primary diet type
              </label>
              <div className="radio-cards" role="radiogroup" aria-labelledby="dietType-label">
                {[
                  { value: 'heavy-meat', title: 'Heavy Meat', desc: 'Red meat daily' },
                  { value: 'average-meat', title: 'Average Meat', desc: 'Beef/poultry occasionally' },
                  { value: 'low-meat', title: 'Low Meat', desc: 'Mostly fish/poultry, rare beef' },
                  { value: 'vegetarian', title: 'Vegetarian', desc: 'No meat, includes dairy/eggs' },
                  { value: 'vegan', title: 'Vegan', desc: 'Plant-based exclusively' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-card ${formData.dietType === opt.value ? 'selected' : ''}`}
                    onClick={() => updateField('dietType', opt.value as DietType)}
                    role="radio"
                    aria-checked={formData.dietType === opt.value}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        updateField('dietType', opt.value as DietType);
                      }
                    }}
                  >
                    <span className="radio-card-title">{opt.title}</span>
                    <span className="radio-card-desc">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" id="localOrganicPref-label">
                Do you purchase local or organic foods?
              </label>
              <div className="radio-cards" role="radiogroup" aria-labelledby="localOrganicPref-label">
                {[
                  { value: 'mostly', title: 'Mostly', desc: 'Prioritize local & organic' },
                  { value: 'average', title: 'Average', desc: 'Some organic, mostly standard' },
                  { value: 'rarely', title: 'Rarely', desc: 'Imported/packaged focus' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-card ${formData.localOrganicPref === opt.value ? 'selected' : ''}`}
                    onClick={() => updateField('localOrganicPref', opt.value as LocalOrganicPref)}
                    role="radio"
                    aria-checked={formData.localOrganicPref === opt.value}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        updateField('localOrganicPref', opt.value as LocalOrganicPref);
                      }
                    }}
                  >
                    <span className="radio-card-title">{opt.title}</span>
                    <span className="radio-card-desc">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" id="shoppingHabit-label">
                How would you describe your shopping habits?
              </label>
              <div className="radio-cards" role="radiogroup" aria-labelledby="shoppingHabit-label">
                {[
                  { value: 'heavy', title: 'Frequent shopper', desc: 'Buy clothes/gadgets weekly' },
                  { value: 'average', title: 'Average consumer', desc: 'Buy only as items wear out' },
                  { value: 'minimalist', title: 'Minimalist', desc: 'Repair, secondhand preference' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-card ${formData.shoppingHabit === opt.value ? 'selected' : ''}`}
                    onClick={() => updateField('shoppingHabit', opt.value as ShoppingHabit)}
                    role="radio"
                    aria-checked={formData.shoppingHabit === opt.value}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        updateField('shoppingHabit', opt.value as ShoppingHabit);
                      }
                    }}
                  >
                    <span className="radio-card-title">{opt.title}</span>
                    <span className="radio-card-desc">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" id="recyclingHabit-label">
                What are your recycling habits?
              </label>
              <div className="radio-cards" role="radiogroup" aria-labelledby="recyclingHabit-label">
                {[
                  { value: 'everything', title: 'Strict recycler', desc: 'Sort metal, paper, glass, plastic' },
                  { value: 'some', title: 'Occasional', desc: 'Recycle some, throw away some' },
                  { value: 'none', title: 'Do not recycle', desc: 'Trash everything together' }
                ].map(opt => (
                  <div
                    key={opt.value}
                    className={`radio-card ${formData.recyclingHabit === opt.value ? 'selected' : ''}`}
                    onClick={() => updateField('recyclingHabit', opt.value as RecyclingHabit)}
                    role="radio"
                    aria-checked={formData.recyclingHabit === opt.value}
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        updateField('recyclingHabit', opt.value as RecyclingHabit);
                      }
                    }}
                  >
                    <span className="radio-card-title">{opt.title}</span>
                    <span className="radio-card-desc">{opt.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div style={{
          display: 'flex',
          justifyContent: step === 1 ? 'flex-end' : 'space-between',
          marginTop: '32px',
          borderTop: '1px solid var(--card-border)',
          paddingTop: '20px'
        }}>
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrev}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Back</span>
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>{step === 4 ? 'Calculate Carbon Score' : 'Continue'}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
};
