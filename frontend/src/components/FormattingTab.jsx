import React from 'react';

const FormattingTab = ({ formattingOptions, setFormattingOptions }) => {

  const handleCheckboxChange = (key) => {
    setFormattingOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (key, value) => {
    setFormattingOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label htmlFor="showPerFlightAverage" className="text-sm font-medium text-gray-700 pr-4">Show per-flight average</label>
        <input
          type="checkbox"
          id="showPerFlightAverage"
          checked={formattingOptions.showPerFlightAverage}
          onChange={() => handleCheckboxChange('showPerFlightAverage')}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="aircraftIcaoOnly" className="text-sm font-medium text-gray-700 pr-4">Show only aircraft ICAO code</label>
        <input
          type="checkbox"
          id="aircraftIcaoOnly"
          checked={!!formattingOptions.aircraftIcaoOnly}
          onChange={() => handleCheckboxChange('aircraftIcaoOnly')}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="rounding" className="block text-sm font-medium text-gray-700 mb-1">Round large numbers</label>
        <select
          id="rounding"
          value={formattingOptions.rounding}
          onChange={(e) => handleInputChange('rounding', e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="none">None</option>
          <option value="auto">Automatic (K/M/B)</option>
          <option value="K">Thousands (K)</option>
          <option value="M">Millions (M)</option>
          <option value="B">Billions (B)</option>
        </select>
      </div>

      <div>
        <label htmlFor="decimalPrecision" className="block text-sm font-medium text-gray-700 mb-1">Decimal Precision</label>
        <input
          type="number"
          id="decimalPrecision"
          value={formattingOptions.decimalPrecision}
          onChange={(e) => handleInputChange('decimalPrecision', parseInt(e.target.value, 10))}
          className="mt-1 block w-full pl-3 pr-1 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          min="0"
          max="10"
        />
      </div>
    </div>
  );
};

export default FormattingTab; 