const columnOptions = [
  { key: 'departures_performed', label: 'Departures' },
  { key: 'seats', label: 'Seats' },
  { key: 'asms', label: 'ASMs' },
  { key: 'passengers', label: 'Passengers' },
  { key: 'rpms', label: 'RPMs' },
  { key: 'load_factor', label: 'Load factor' },
];

const ColumnsTab = ({ visibleColumns, setVisibleColumns }) => {
  const visibleCount = columnOptions.filter(({ key }) => visibleColumns[key]).length;

  return (
    <div className="dashboard-options">
      <p className="dashboard-option-caption">Metrics</p>
      <div className="dashboard-option-grid">
        {columnOptions.map(({ key, label }) => (
          <label key={key} className={`dashboard-option${visibleColumns[key] ? ' is-selected' : ''}`}>
            <input
              type="checkbox"
              checked={Boolean(visibleColumns[key])}
              disabled={visibleCount === 1 && Boolean(visibleColumns[key])}
              onChange={() => setVisibleColumns((current) => ({ ...current, [key]: !current[key] }))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
      <p className="dashboard-panel-hint">Choose which metrics appear in the table and CSV export. Keep at least one visible.</p>
    </div>
  );
};

export default ColumnsTab;
