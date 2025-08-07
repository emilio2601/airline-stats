import React, { useState, useEffect } from 'react';
import { aircraftCodes } from '../../data/aircraft_codes.js';

const AircraftFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [aircraftIcao, setAircraftIcao] = useState(filters.aircraft_type || '')

  const applyFilter = () => {
    closePopover()
    const aircraft = aircraftCodes.find(ac => ac.icao?.includes(aircraftIcao.toUpperCase()));
    const numericCode = aircraft ? aircraft.code : null;
    setFilters((f) => ({ ...f, aircraft_type: numericCode}))
  }

  useEffect(() => {
    setConfig({name: "Aircraft Type", keys: ["aircraft_type"]});
    if (filters.aircraft_type) {
      const aircraft = aircraftCodes.find(ac => ac.code === filters.aircraft_type);
      const matchingIcao = aircraft?.icao.find(code => code === aircraftIcao.toUpperCase()) || aircraft?.icao[0];
      setBreakdown(matchingIcao || filters.aircraft_type);
    } else {
      setBreakdown(null)
    }
  }, [filters.aircraft_type, setConfig, setBreakdown, aircraftIcao])

  return (
    <>
      <span className="font-bold text-base">Filter by Aircraft</span>
      <input type="text" placeholder="ICAO code" value={aircraftIcao} onChange={(e) => setAircraftIcao(e.target.value)} className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

export default AircraftFilter; 