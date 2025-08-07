import React, { useState, useEffect } from 'react';

const serviceClassMap = {
  'F': 'Scheduled Passenger',
  'G': 'Scheduled Cargo',
  'L': 'Charter Passenger',
  'P': 'Charter Cargo',
}

const ClassFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [serviceClass, setServiceClass] = useState(filters.service_class || '')

  const applyFilter = () => {
    closePopover()
    setFilters((f) => ({ ...f, service_class: serviceClass}))
  }

  useEffect(() => {
    setConfig({name: "Class", keys: ["service_class"]});
    if (filters.service_class) {
      setBreakdown(serviceClassMap[filters.service_class] || filters.service_class)
    } else {
      setBreakdown(null)
    }
  }, [filters.service_class, setConfig, setBreakdown])

  return (
    <>
      <span>Filter by Class</span>
      <select value={serviceClass} onChange={(e) => setServiceClass(e.target.value)} className="border p-2 w-full">
        <option value="">Any</option>
        <option value="F">Scheduled Passenger</option>
        <option value="G">Scheduled Cargo</option>
        <option value="L">Charter Passenger</option>
        <option value="P">Charter Cargo</option>
      </select>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  ) 
}

export default ClassFilter; 