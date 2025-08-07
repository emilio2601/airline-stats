import React, { useState, useEffect } from 'react';

const AircraftFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [aircraftType, setAircraftType] = useState(filters.aircraft_type || '')

  const applyFilter = () => {
    closePopover()
    setFilters((f) => ({ ...f, aircraft_type: aircraftType}))
  }

  useEffect(() => {
    setConfig({name: "Aircraft Type", keys: ["aircraft_type"]});
    if (filters.aircraft_type) {
      setBreakdown(filters.aircraft_type)
    } else {
      setBreakdown(null)
    }
  }, [filters.aircraft_type, setConfig, setBreakdown])

  return (
    <>
      <span>Filter by Aircraft</span>
      <input type="text" placeholder="ICAO code" value={aircraftType} onChange={(e) => setAircraftType(e.target.value)} className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

export default AircraftFilter; 