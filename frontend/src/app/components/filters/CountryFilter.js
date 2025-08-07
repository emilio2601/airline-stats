import React, { useState, useEffect } from 'react';

const CountryFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
  const [originCountry, setOriginCountry] = useState(filters.origin_country || "US")
  const [destCountry, setDestCountry] = useState(filters.dest_country || "GB")
  const [isBidirectional, setIsBidirectional] = useState(filters.bidirectional_country || false)

  const applyFilter = () => {
    closePopover()
    setFilters((f) => ({...f, origin_country: originCountry, dest_country: destCountry, bidirectional_country: isBidirectional}))
  }

  const flipOriginDest = () => {
    setOriginCountry(destCountry)
    setDestCountry(originCountry)
  }

  useEffect(() => {
    setConfig({name: "Country", keys: ["origin_country", "dest_country", "bidirectional_country"]})
    if (filters.origin_country || filters.dest_country) {
      setBreakdown(`${filters.origin_country || ''} ${filters.bidirectional_country ? "<->" : "-"} ${filters.dest_country || ''}`)
    } else {
      setBreakdown(null)
    }
  }, [filters.origin_country, filters.dest_country, filters.bidirectional_country, setConfig, setBreakdown])

  return (
    <>
      <span>Filter by Country</span>
      <div className="flex flex-row space-x-2">
        <input type="text" placeholder="Origin" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="border p-2 w-24"/>
        <button className="cursor-pointer" onClick={flipOriginDest}>
          <i className="fa-solid fa-right-left"></i>
        </button>
        <input type="text" placeholder="Destination" value={destCountry} onChange={(e) => setDestCountry(e.target.value)}  className="border p-2 w-24"/>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="isBidirectionalCountry" name="isBidirectionalCountry" checked={isBidirectional} onChange={(e) => setIsBidirectional(!isBidirectional)}/>
        <label htmlFor="isBidirectionalCountry">Include both directions?</label>
      </div>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

export default CountryFilter; 