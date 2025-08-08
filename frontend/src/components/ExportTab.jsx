import React from 'react';

const ExportTab = ({ onExport }) => {
  return (
    <div className="flex flex-col text-sm text-gray-900 min-w-64 pr-2 pb-2">
      <h3 className="font-bold text-base mb-2">Export as CSV</h3>
      <p className="text-sm text-gray-600 mb-4">
        Download the current view as a CSV file. The file will respect all the filters and sorting options you have selected.
      </p>
      <button 
        onClick={onExport}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
      >
        Export
      </button>
    </div>
  );
};

export default ExportTab;
