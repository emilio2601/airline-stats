import { useRef, useState } from 'react';

const airportList = (value) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(values.flatMap((part) => String(part).split(','))
    .map((code) => code.trim().toUpperCase()).filter(Boolean))];
};

const readInput = (value) => {
  const text = value.toUpperCase();
  if (/[^A-Z\s,;]/.test(text)) return null;

  const parts = text.split(/[\s,;]+/).filter(Boolean);
  const endsWithSeparator = /[\s,;]$/.test(text);
  const codes = [];
  let remainder = '';

  for (const [index, part] of parts.entries()) {
    if (part.length === 3) codes.push(part);
    else if (part.length < 3 && index === parts.length - 1 && !endsWithSeparator) remainder = part;
    else return null;
  }

  return { codes, remainder };
};

const AirportFilter = ({ filters, setFilters }) => {
  const [inputs, setInputs] = useState({ origin: '', dest: '' });
  const [errors, setErrors] = useState({ origin: '', dest: '' });
  const originInputRef = useRef(null);
  const destInputRef = useRef(null);
  const origins = airportList(filters.origin);
  const destinations = airportList(filters.dest);

  const updateSide = (side, change) => {
    setFilters((current) => {
      const codes = change(airportList(current[side]));
      return { ...current, [side]: codes.length ? codes : null, page: 1 };
    });
  };

  const handleInput = (side, value) => {
    const parsed = readInput(value);
    if (!parsed) {
      setInputs((current) => ({ ...current, [side]: value.toUpperCase() }));
      setErrors((current) => ({ ...current, [side]: 'Use three-letter codes, separated by commas or spaces.' }));
      return;
    }

    setInputs((current) => ({ ...current, [side]: parsed.remainder }));
    setErrors((current) => ({ ...current, [side]: '' }));
    if (parsed.codes.length) {
      updateSide(side, (codes) => [...new Set([...codes, ...parsed.codes])]);
    }
  };

  const renderSide = (side, codes) => (
    <div className="airport-side">
      <label className="dashboard-field-label" htmlFor={`${side}-airport-input`}>{side === 'origin' ? 'From' : 'To'}</label>
      <div className={`airport-chip-box${codes.length ? ' is-active' : ''}${errors[side] ? ' has-error' : ''}`} onClick={(event) => {
        if (event.target === event.currentTarget) (side === 'origin' ? originInputRef : destInputRef).current?.focus();
      }}>
        {codes.map((code) => (
          <button key={code} type="button" className="airport-chip" onClick={() => updateSide(side, (current) => current.filter((airport) => airport !== code))} aria-label={`Remove ${code} from ${side} airports`}>
            {code}<span aria-hidden="true">×</span>
          </button>
        ))}
        <input
          id={`${side}-airport-input`}
          ref={side === 'origin' ? originInputRef : destInputRef}
          className="airport-chip-input"
          type="text"
          autoComplete="off"
          spellCheck="false"
          aria-invalid={Boolean(errors[side])}
          aria-describedby={errors[side] ? `${side}-airport-error` : undefined}
          placeholder={codes.length ? 'Add another 3-letter code' : 'Any airport · type a 3-letter code'}
          value={inputs[side]}
          onChange={(event) => handleInput(side, event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Backspace' && !inputs[side] && codes.length) {
              updateSide(side, (current) => current.slice(0, -1));
            }
            if (event.key === 'Enter') {
              event.preventDefault();
              if (inputs[side]) setErrors((current) => ({ ...current, [side]: 'Finish the three-letter code.' }));
            }
          }}
          onBlur={() => {
            if (inputs[side] && !errors[side]) setErrors((current) => ({ ...current, [side]: 'Finish the three-letter code.' }));
          }}
        />
      </div>
      {errors[side] && <p id={`${side}-airport-error`} className="airport-error" role="alert">{errors[side]}</p>}
    </div>
  );

  return (
    <div className="airport-picker">
      <div className="airport-picker-heading">
        <h2>Build a route set</h2>
        <p>Type 3-letter airport codes, such as LAX or GDL. Each code adds a chip and updates results automatically; airport names are not supported.</p>
      </div>
      <div className="airport-picker-grid">
        {renderSide('origin', origins)}
        <button type="button" className="airport-swap" onClick={() => setFilters((current) => ({ ...current, origin: current.dest || null, dest: current.origin || null, page: 1 }))} aria-label="Swap origin and destination airports">⇄</button>
        {renderSide('dest', destinations)}
      </div>
      <div className="airport-picker-footer">
        <label className={`dashboard-check${filters.bidirectional_airport ? ' is-active' : ''}`}>
          <input type="checkbox" checked={Boolean(filters.bidirectional_airport)} onChange={(event) => setFilters((current) => ({ ...current, bidirectional_airport: event.target.checked, page: 1 }))} />
          Include both airport directions
        </label>
        <span className="airport-picker-hint">Changes update results automatically</span>
      </div>
    </div>
  );
};

export default AirportFilter;
