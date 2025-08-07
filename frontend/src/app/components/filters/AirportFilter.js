import React, { useState, useEffect } from 'react';

const AirportFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [originAirport, setOriginAirport] = useState(filters.origin || '')
  const [destAirport, setDestAirport] = useState(filters.dest || '')
  const [isBidirectional, setIsBidirectional] = useState(filters.bidirectional_airport || false)

  const applyFilter = () => {
    closePopover()
    setFilters((f) => ({...f, origin: originAirport, dest: destAirport, bidirectional_airport: isBidirectional}))
  }

  const flipOriginDest = () => {
    setOriginAirport(destAirport)
    setDestAirport(originAirport)
  }

  useEffect(() => {
    setConfig({name: "Airport", keys: ["origin", "dest", "bidirectional_airport"]})
    
    let breakdownText = null;
    if (filters.bidirectional_airport) {
      if (filters.origin && filters.dest) {
        breakdownText = `${filters.origin} <-> ${filters.dest}`;
      } else if (filters.origin) {
        breakdownText = `To/From ${filters.origin}`;
      } else if (filters.dest) {
        breakdownText = `To/From ${filters.dest}`;
      }
    } else {
      if (filters.origin && filters.dest) {
        breakdownText = `${filters.origin} - ${filters.dest}`;
      } else if (filters.origin) {
        breakdownText = `From ${filters.origin}`;
      } else if (filters.dest) {
        breakdownText = `To ${filters.dest}`;
      }
    }
    setBreakdown(breakdownText);

  }, [filters.origin, filters.dest, filters.bidirectional_airport, setConfig, setBreakdown])

  return (
    <>
      <span>Filter by Airport</span>
      <div className="flex flex-row space-x-2">
        <input type="text" placeholder="Origin" value={originAirport} onChange={(e) => setOriginAirport(e.target.value)} className="border p-2 w-24"/>
        <button class="cursor-pointer" onClick={flipOriginDest}>
          <i className="fa-solid fa-right-left"></i>
        </button>
        <input type="text" placeholder="Destination" value={destAirport} onChange={(e) => setDestAirport(e.target.value)}  className="border p-2 w-24"/>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="isBidirectional" name="isBidirectional" value="isBidirectional" checked={isBidirectional} onChange={(e) => setIsBidirectional(!isBidirectional)}/>
        <label for="isBidirectional">Include both directions?</label>
      </div>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

export default AirportFilter; 