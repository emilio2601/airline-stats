'use client';

import { useEffect, useState } from 'react';
import WfPopover from './wf_popover';
import axios from 'axios';

import aircraftCodes from './aircraft_codes';

export default function Home() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({order_by: "carrier", order_dir: "asc"});

  useEffect(() => {
    axios.get('http://localhost:3210/routes', {params: filters}).then((response) => {
      setData(response.data);
      console.log(response.data)
    });
  }, [filters]);

  const formatNumber = (number) => Intl.NumberFormat().format(number)
  const getFormattedLoadFactor = (passengers, seats) => (passengers * 100/seats).toFixed(2) + '%'

  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-4">
      <div className="flex flex-row space-x-0">
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AirportFilter  {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AirlineFilter  {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <CountryFilter  {...{closePopover, setBreakdown, setFilters, setConfig}} />}/>
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AircraftFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />}/>
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <DateFilter     {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <GroupingFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
      </div>

      <table className='border-spacing-2 text-center border border-separate border-white'>
        <thead>
          <TableHeader filters={filters} setFilters={setFilters} />
        </thead>
        <tbody>
          {data && data.map((route) => (
            <tr>
              <td>{route.carrier}</td>
              <td>{aircraftCodes[route.aircraft_type] || aircraft_type}</td>
              <td>{formatNumber(route.departures_scheduled)} ({formatNumber(route.departures_performed)})</td>
              <td>{formatNumber(route.seats)} ({formatNumber(Math.round(route.seats / route.departures_performed))})</td>
              <td>{formatNumber(route.passengers)} ({formatNumber(Math.round(route.passengers / route.departures_performed))})</td>
              <td>{getFormattedLoadFactor(route.passengers, route.seats)}</td>
            </tr>
          ))}
        </tbody>
      </table>
     </main>
  )
}

const TableHeader = ( { filters, setFilters }) => {
  const columnHeaders = [
    {key: "carrier", value: "Airline"},
    {key: "aircraft_type", value: "Aircraft Type"},
    {key: "departures_performed", value: "Departures scheduled (performed)"},
    {key: "seats", value: "Seats (per flight)"},
    {key: "passengers", value: "Passengers (per flight)"},
    {key: "passengers", value: "Load Factor"},
  ]

  const addSortToFilter = (col) => {
    setFilters((f) => {return {...f, order_by: col.key, order_dir: f.order_dir == "desc" ? "asc" : "desc", page: 1}})
  }

  return (
    <tr>
      {columnHeaders.map((col, i) => (
        <th key={i} onClick={() => addSortToFilter(col)} className="cursor-pointer align-text-top">
          {col.value}
          {col.key == filters.order_by && filters.order_dir == "desc" && <i className="fa fa-chevron-down scale-75 pl-1"></i>}
          {col.key == filters.order_by && filters.order_dir == "asc" && <i className="fa fa-chevron-up scale-75 pl-1"></i>}
        </th>
      ))}
    </tr>
  )
}

const AirportFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [originAirport, setOriginAirport] = useState('')
  const [destAirport, setDestAirport] = useState('')

  const applyFilter = () => {
    closePopover()
    setBreakdown(`${originAirport} - ${destAirport}`)
    setFilters((f) => ({...f, origin: originAirport, dest: destAirport}))
  }

  useEffect(() => setConfig({name: "Airport", keys: ["origin", "dest"]}), [])

  return (
    <>
      <span>Filter by Airport</span>
      <input type="text" placeholder="Origin" value={originAirport} onChange={(e) => setOriginAirport(e.target.value)} className="border p-2"/>
      <input type="text" placeholder="Destination" value={destAirport} onChange={(e) => setDestAirport(e.target.value)}  className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

const CountryFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [originCountry, setOriginCountry] = useState('')
  const [destCountry, setDestCountry] = useState('')

  const applyFilter = () => {
    closePopover()
    setBreakdown(`${originCountry} - ${destCountry}`)
    setFilters((f) => ({...f, origin_country: originCountry, dest_country: destCountry}))
  }

  useEffect(() => setConfig({name: "Country", keys: ["origin_country", "dest_country"]}), [])

  return (
    <>
      <span>Filter by Country</span>
      <input type="text" placeholder="Origin (ISO alpha-2)" value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} className="border p-2"/>
      <input type="text" placeholder="Destination (ISO alpha-2)" value={destCountry} onChange={(e) => setDestCountry(e.target.value)}  className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

const AirlineFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [airline, setAirline] = useState('')

  const applyFilter = () => {
    closePopover()
    setBreakdown(airline)
    setFilters((f) => ({ ...f, carrier: airline}))
  }

  useEffect(() => setConfig({name: "Airline", keys: ["carrier"]}), [])

  return (
    <>
      <span>Filter by Airline</span>
      <input type="text" placeholder="IATA code" value={airline} onChange={(e) => setAirline(e.target.value)} className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

const AircraftFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [aircraftType, setAircraftType] = useState('')

  const applyFilter = () => {
    closePopover()
    setBreakdown(aircraftType)
    setFilters((f) => ({ ...f, aircraft_type: aircraftType}))
  }

  useEffect(() => setConfig({name: "Aircraft Type", keys: ["aircraft_type"]}), [])

  return (
    <>
      <span>Filter by Aircraft</span>
      <input type="text" placeholder="ICAO code" value={aircraftType} onChange={(e) => setAircraftType(e.target.value)} className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

const DateFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [date, setDate] = useState('')

  const applyFilter = () => {
    closePopover()
    setBreakdown(date)
    setFilters((f) => ({ ...f, date: date}))
  }

  useEffect(() => setConfig({name: "Date", keys: ["date"]}), [])

  return (
    <>
      <span>Filter by Date</span>
      <input type="text" placeholder="YYYY-MM-DD" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

const GroupingFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const applyFilter = () => {
    closePopover()
    setBreakdown(date)
    setFilters((f) => ({ ...f}))
  }

  useEffect(() => {setConfig({name: "Group by", keys: ["group_by"]}); setBreakdown("Airline, Aircraft Type")}, [])

  return (
    <>
      <span>Group by</span>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}


const BaseFilter = ({ component, setFilters}) => {
  const [breakdown, setBreakdown] = useState(null)
  const [config, setConfig] = useState({name: "", keys: []})

  const handleFilterClear = (e, closePopover) => {
    e.stopPropagation()
    setBreakdown(null)
    setFilters((f) => {
      const outFilters = {...f}
      config.keys.map((k) => (outFilters[k] = null))
      return outFilters
    })
    closePopover()
  }

  return (
    <WfPopover trigger={"click"} placement="bottom-start" color="white" renderCallback={({ closePopover }) => (
      <>
        <WfPopover.Trigger>
          <div className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50">
            <div>
              {breakdown  && <i className="fa fa-times-circle pr-1.5" onClick={(e) => handleFilterClear(e, closePopover)} />}
              {!breakdown && <i className="fa fa-plus-circle pr-1.5" />}
            </div>
            <div>
              <span>{config.name}</span>
              {breakdown && <span className="mx-1.5">|</span>}
              {breakdown && <span className="text-blue-400">{breakdown}</span>}
            </div>
          </div>
        </WfPopover.Trigger>
        <WfPopover.Container>
          <div className="flex flex-col text-sm space-y-4 text-gray-900">
            {component(closePopover, setBreakdown, setConfig)}
          </div>
        </WfPopover.Container>
      </>
    )}>
    </WfPopover>
  )
}