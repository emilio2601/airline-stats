import React, { useState, useEffect } from 'react';

const AirlineFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [airlines, setAirlines] = useState(filters.carrier || [])
  const [inputAirline, setInputAirline] = useState("")

  const applyFilter = () => {
    let newAirlines = [...airlines, inputAirline].filter((a) => a != "")
    setAirlines(newAirlines)
    setFilters((f) => ({ ...f, carrier: newAirlines}))
    setInputAirline("")
  }

  const removeAirline = (i) => {
    let newAirlines = airlines.filter((_, j) => j != i)
    setAirlines(newAirlines)
    setFilters((f) => ({ ...f, carrier: newAirlines}))
  }

  useEffect(() => {
    setConfig({name: "Airline", keys: ["carrier"]});
    if (filters.carrier && filters.carrier.length > 0) {
      setBreakdown(filters.carrier.join(", "))
    } else {
      setBreakdown(null)
    }
    setAirlines(filters.carrier || [])
  }, [filters.carrier, setConfig, setBreakdown])

  return (
    <>
      <span>Filter by Airline</span>
      <input type="text" placeholder="IATA code" value={inputAirline} onChange={(e) => setInputAirline(e.target.value)} className="border p-2"/>
      {airlines.length > 0 && <div className="flex flex-row space-x-3">
        {airlines.map((a, i) => (
          <div key={i} className="flex flex-row space-x-1">
            <span>{a}</span>
            <button className="text-red-500" onClick={() => removeAirline(i)}>
              <i className="fa fa-times-circle"></i>
            </button> 
          </div>
        ))}
      </div>}
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Add airline</button>
    </>
  )
}

export default AirlineFilter; 