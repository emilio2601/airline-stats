import React, { useState, useEffect } from 'react';

const groupingHeaders = [
  {key: "carrier", value: "Airline"},
  {key: "aircraft_type", value: "Aircraft Type"},
  {key: "origin", value: "Origin"},
  {key: "dest", value: "Destination"},
  {key: "origin_country", value: "Origin Country"},
  {key: "dest_country", value: "Destination Country"},
  {key: "month", value: "Month"},
  {key: "quarter", value: "Quarter"},
  {key: "year", value: "Year"},
]

const GroupingTab = ({ setFilters, filters }) => {
  const [byAirline, setByAirline] = useState(filters.group_by?.includes("carrier") || false)
  const [byAircraft, setByAircraft] = useState(filters.group_by?.includes("aircraft_type") || false)
  const [byOriginAirport, setByOriginAirport] = useState(filters.group_by?.includes("origin") || false)
  const [byDestAirport, setByDestAirport] = useState(filters.group_by?.includes("dest") || false)
  const [byOriginCountry, setByOriginCountry] = useState(filters.group_by?.includes("origin_country") || false)
  const [byDestCountry, setByDestCountry] = useState(filters.group_by?.includes("dest_country") || false)
  const [byYear, setByYear] = useState(filters.group_by?.includes("year") || false)
  const [byQuarter, setByQuarter] = useState(filters.group_by?.includes("quarter") || false)
  const [byMonth, setByMonth] = useState(filters.group_by?.includes("month") || false)

  const applyFilter = () => {
    const groupBy = []

    if (byAirline) groupBy.push("carrier");
    if (byAircraft) groupBy.push("aircraft_type");
    if (byOriginAirport) groupBy.push("origin");
    if (byDestAirport) groupBy.push("dest");
    if (byOriginCountry) groupBy.push("origin_country");
    if (byDestCountry) groupBy.push("dest_country");
    if (byYear) groupBy.push("year");
    if (byQuarter) groupBy.push("quarter");
    if (byMonth) groupBy.push("month");

    setFilters((f) => ({ ...f, group_by: groupBy}))
  }

  useEffect(() => {
    const currentGroups = filters.group_by || [];
    setByAirline(currentGroups.includes("carrier"));
    setByAircraft(currentGroups.includes("aircraft_type"));
    setByOriginAirport(currentGroups.includes("origin"));
    setByDestAirport(currentGroups.includes("dest"));
    setByOriginCountry(currentGroups.includes("origin_country"));
    setByDestCountry(currentGroups.includes("dest_country"));
    setByYear(currentGroups.includes("year"));
    setByQuarter(currentGroups.includes("quarter"));
    setByMonth(currentGroups.includes("month"));
  }, [filters.group_by])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="airline" name="airline" value="airline" checked={byAirline} onChange={(e) => setByAirline(!byAirline)}/>
          <label htmlFor="airline">Airline</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="aircraft_type" name="aircraft_type" value="aircraft_type" checked={byAircraft} onChange={(e) => setByAircraft(!byAircraft)}/>
          <label htmlFor="aircraft_type">Aircraft type</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="origin" name="origin" value="origin" checked={byOriginAirport} onChange={(e) => setByOriginAirport(!byOriginAirport)}/>
          <label htmlFor="origin">Origin airport</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="dest" name="dest" value="dest" checked={byDestAirport} onChange={(e) => setByDestAirport(!byDestAirport)}/>
          <label htmlFor="dest">Destination airport</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="origin_country" name="origin_country" value="origin_country" checked={byOriginCountry} onChange={(e) => setByOriginCountry(!byOriginCountry)}/>
          <label htmlFor="origin_country">Origin country</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="dest_country" name="dest_country" value="dest_country" checked={byDestCountry} onChange={(e) => setByDestCountry(!byDestCountry)}/>
          <label htmlFor="dest_country">Destination country</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="year" name="year" value="year" checked={byYear} onChange={(e) => setByYear(!byYear)}/>
          <label htmlFor="year">Year</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="quarter" name="quarter" value="quarter" checked={byQuarter} onChange={(e) => setByQuarter(!byQuarter)}/>
          <label htmlFor="quarter">Quarter</label>
        </div>
        <div className="flex flex-row space-x-2">
          <input type="checkbox" id="month" name="month" value="month" checked={byMonth} onChange={(e) => setByMonth(!byMonth)}/>
          <label htmlFor="month">Month</label>
        </div>
      </div>

      <button className='bg-green-500 p-2 text-white rounded-md w-full mt-2' onClick={applyFilter}>Apply Grouping</button>
    </div>
  )
}

export default GroupingTab; 