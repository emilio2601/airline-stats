import React, { useState } from 'react';

const columnHeaders = [
  {key: "departures_performed", value: "Departures performed"},
  {key: "seats", value: "Seats (per flight)"},
  {key: "asms", value: "ASMs", className: "hidden md:block"},
  {key: "passengers", value: "Passengers (per flight)"},
  {key: "rpms", value: "RPMs", className: "hidden md:block"},
  {key: "load_factor", value: "Load Factor"},
]

const ColumnsTab = ({ visibleColumns, setVisibleColumns }) => {

  const handleCheckboxChange = (key) => {
    setVisibleColumns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-2">
      {columnHeaders.map(col => (
        <div key={col.key} className="flex flex-row space-x-2">
          <input
            type="checkbox"
            id={`col-${col.key}`}
            name={col.key}
            checked={visibleColumns[col.key]}
            onChange={() => handleCheckboxChange(col.key)}
          />
          <label htmlFor={`col-${col.key}`}>{col.value}</label>
        </div>
      ))}
    </div>
  );
};

export default ColumnsTab; 