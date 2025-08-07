import React, { useState, useEffect } from 'react';

const CountryFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [originCountry, setOriginCountry] = useState(filters.origin_country || "US")
  const [destCountry, setDestCountry] = useState(filters.dest_country || "GB")

  const applyFilter = () => {
    closePopover()
    setFilters((f) => ({...f, origin_country: originCountry, dest_country: destCountry}))
  }

  useEffect(() => {
    setConfig({name: "Country", keys: ["origin_country", "dest_country"]})
    if (filters.origin_country || filters.dest_country) {
      setBreakdown(`${filters.origin_country || ''} - ${filters.dest_country || ''}`)
    } else {
      setBreakdown(null)
    }
  }, [filters.origin_country, filters.dest_country, setConfig, setBreakdown])

  return (
    <>
      <span>Filter by Country</span>
      <input type="text" placeholder="Origin (ISO alpha-2)" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="border p-2"/>
      <input type="text" placeholder="Destination (ISO alpha-2)" value={destCountry} onChange={(e) => setDestCountry(e.target.value)}  className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

export default CountryFilter; 