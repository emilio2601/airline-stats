import React, { useState, useEffect } from 'react';

const AirportFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [originAirport, setOriginAirport] = useState(filters.origin || '')
  const [destAirport, setDestAirport] = useState(filters.dest || '')
  const [isBidirectional, setIsBidirectional] = useState(filters.bidirectional || false)

  const applyFilter = () => {
    closePopover()
    setFilters((f) => ({...f, origin: originAirport, dest: destAirport, bidirectional: isBidirectional}))
  }

  const flipOriginDest = () => {
    setOriginAirport(destAirport)
    setDestAirport(originAirport)
  }

  useEffect(() => {
    setConfig({name: "Airport", keys: ["origin", "dest", "bidirectional"]})
    if (filters.origin || filters.dest) {
      setBreakdown(`${filters.origin || ''} ${filters.bidirectional ? "<->" : "-"} ${filters.dest || ''}`)
    } else {
      setBreakdown(null)
    }
  }, [filters.origin, filters.dest, filters.bidirectional, setConfig, setBreakdown])

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