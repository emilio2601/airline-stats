const groupingSections = [
  {
    title: 'Route',
    options: [
      { key: 'carrier', label: 'Airline' },
      { key: 'aircraft_type', label: 'Aircraft type' },
      { key: 'origin', label: 'Origin airport' },
      { key: 'dest', label: 'Destination airport' },
      { key: 'origin_country', label: 'Origin country' },
      { key: 'dest_country', label: 'Destination country' },
    ],
  },
  {
    title: 'Time',
    options: [
      { key: 'year', label: 'Year' },
      { key: 'quarter', label: 'Quarter' },
      { key: 'month', label: 'Month' },
    ],
  },
];

const GroupingTab = ({ setFilters, filters }) => {
  const selected = Array.isArray(filters.group_by) ? filters.group_by : [];

  const toggle = (key) => {
    setFilters((current) => {
      const groups = Array.isArray(current.group_by) ? current.group_by : [];
      return {
        ...current,
        group_by: groups.includes(key) ? groups.filter((group) => group !== key) : [...groups, key],
        page: 1,
      };
    });
  };

  return (
    <div className="dashboard-options">
      {groupingSections.map((section) => (
        <div className="dashboard-option-section" key={section.title}>
          <p className="dashboard-option-caption">{section.title}</p>
          <div className="dashboard-option-grid">
            {section.options.map(({ key, label }) => (
              <label key={key} className={`dashboard-option${selected.includes(key) ? ' is-selected' : ''}`}>
                <input type="checkbox" checked={selected.includes(key)} onChange={() => toggle(key)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupingTab;
