'use client';

import { useEffect, useState } from 'react';
import WfPopover from './wf_popover';
import axios from 'axios';

import aircraftCodes from './aircraft_codes';

export default function Home() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    axios.get('http://localhost:3210/routes', {params: filters}).then((response) => {
      setData(Object.entries(response.data));
      console.log(response.data)
    });
  }, [filters]);

  const formatNumber = (number) => Intl.NumberFormat().format(number)
  const getFormattedLoadFactor = (passengers, seats) => (passengers * 100/seats).toFixed(2) + '%'

  return (
    <main className="flex min-h-screen flex-col items-center p-24 space-y-4">
      <div className="flex flex-row space-x-0">
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AirportFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AirlineFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter name="Aircraft Type" component={(closePopover, setBreakdown, setConfig) => <AirlineFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />}/>
        <BaseFilter name="Date"component={(closePopover, setBreakdown, setConfig) => <AirlineFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
      </div>

      <table className='border-spacing-2 text-center border border-separate border-white'>
        <thead>
          <th>Airline</th>
          <th>Aircraft Type</th>
          <th>Departures scheduled</th>
          <th>Departures performed</th>
          <th>Seats</th>
          <th>Passengers</th>
          <th>Load Factor</th>
        </thead>
        <tbody>
          {data && data.map((route) => Object.entries(route[1]).map(([ac_type, details]) => (
            <tr>
              <td>{route[0]}</td>
              <td>{aircraftCodes[ac_type]}</td>
              <td>{formatNumber(details.departures_scheduled)}</td>
              <td>{formatNumber(details.departures_performed)}</td>
              <td>{formatNumber(details.seats)}</td>
              <td>{formatNumber(details.passengers)}</td>
              <td>{getFormattedLoadFactor(details.passengers, details.seats)}</td>
            </tr>
          )))}
        </tbody>
      </table>
     </main>
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
              {breakdown && <span className="mx-2">|</span>}
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