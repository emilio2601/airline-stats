import { formatNumber } from '../utils/numberFormat';

const FormattingTab = ({ formattingOptions, setFormattingOptions }) => {
  const update = (key, value) => setFormattingOptions((current) => ({ ...current, [key]: value }));
  const significantDigits = formattingOptions.significantDigits ?? 3;
  const exampleOptions = { rounding: formattingOptions.rounding, significantDigits };

  return (
    <div className="dashboard-formatting-options">
      <label className="dashboard-setting-toggle">
        <span>
          <strong>Per-flight averages</strong>
          <small>Show averages beside total seats and passengers</small>
        </span>
        <input
          type="checkbox"
          checked={Boolean(formattingOptions.showPerFlightAverage)}
          onChange={(event) => update('showPerFlightAverage', event.target.checked)}
        />
      </label>

      <div className="dashboard-setting-grid">
        <label className="dashboard-setting-field">
          <span>Airline labels</span>
          <select
            value={formattingOptions.airlineLabelFormat || (formattingOptions.airlineIataOnly ? 'iata_only' : 'name_only')}
            onChange={(event) => update('airlineLabelFormat', event.target.value)}
          >
            <option value="name_only">Name</option>
            <option value="iata_only">Code</option>
            <option value="iata_name">Code + name</option>
          </select>
        </label>
        <label className="dashboard-setting-field">
          <span>Aircraft labels</span>
          <select
            value={formattingOptions.aircraftLabelFormat || (formattingOptions.aircraftIcaoOnly ? 'icao_only' : 'name_icao')}
            onChange={(event) => update('aircraftLabelFormat', event.target.value)}
          >
            <option value="name_icao">Name + ICAO</option>
            <option value="icao_only">ICAO code</option>
            <option value="name_only">Name</option>
          </select>
        </label>
        <label className="dashboard-setting-field">
          <span>Large numbers</span>
          <select value={formattingOptions.rounding || 'none'} onChange={(event) => update('rounding', event.target.value)}>
            <option value="none">Full values</option>
            <option value="auto">Automatic K / M / B</option>
            <option value="K">Thousands (K)</option>
            <option value="M">Millions (M)</option>
            <option value="B">Billions (B)</option>
          </select>
        </label>
        <label className="dashboard-setting-field">
          <span>Significant digits</span>
          <select
            value={significantDigits}
            disabled={!formattingOptions.rounding || formattingOptions.rounding === 'none'}
            onChange={(event) => update('significantDigits', Number(event.target.value))}
          >
            {[2, 3, 4, 5].map((digits) => <option key={digits} value={digits}>{digits} digits</option>)}
          </select>
        </label>
        <label className="dashboard-setting-field">
          <span>Load factor decimals</span>
          <input
            type="number"
            min="0"
            max="10"
            value={formattingOptions.decimalPrecision ?? 0}
            onChange={(event) => update('decimalPrecision', Math.min(10, Math.max(0, Number(event.target.value) || 0)))}
          />
        </label>
      </div>
      {formattingOptions.rounding && formattingOptions.rounding !== 'none' && <p className="dashboard-panel-hint">For example: 2,886,265 → {formatNumber(2_886_265, exampleOptions)} · 900,068 → {formatNumber(900_068, exampleOptions)}</p>}
    </div>
  );
};

export default FormattingTab;
