'use client';

import { useEffect, useState } from 'react';
import WfPopover from './wf_popover';
import axios from 'axios';
import dayjs from 'dayjs';

import { aircraftCodes } from './aircraft_codes';
import { airlineCodes } from './airline_codes';

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

const columnHeaders = [
  {key: "departures_performed", value: "Departures performed"},
  {key: "seats", value: "Seats (per flight)"},
  {key: "asms", value: "ASMs", className: "hidden md:block"},
  {key: "passengers", value: "Passengers (per flight)"},
  {key: "rpms", value: "RPMs", className: "hidden md:block"},
  {key: "load_factor", value: "Load Factor"},
]

const quarterMap = {
  "01": "Q1",
  "04": "Q2",
  "07": "Q3",
  "10": "Q4"
}

export default function Home() {
  const [data, setData] = useState({});
  const [dateRange, setDateRange] = useState({});
  const [filters, setFilters] = useState({page: 1, items_per_page: 20, order_by: "seats", order_dir: "desc", group_by: ["carrier"], origin_country: "US", dest_country: "GB", from_date: "2023-01-01"});

  const baseURL = process.env.NODE_ENV == "development" ? "http://localhost:3210" : ""

  useEffect(() => {
    if (groupingHeaders.map((col) => col.key).includes(filters.order_by) && !filters.group_by.includes(filters.order_by)) {
      setFilters({...filters, order_by: "seats", order_dir: "desc"})
    } else {
      axios.get(`${baseURL}/routes`, {params: filters}).then((response) => {
        setData(response.data);
        console.log(response.data)
      });
    }
  }, [filters]);

  useEffect(async () => {
    const res = await axios.get(`${baseURL}/routes/date_range`)

    console.log(res.data)

    setDateRange(res.data)
  }, [])

  const formatNumber = (number) => Intl.NumberFormat().format(number)
  const getFormattedLoadFactor = (lf) => (lf * 100)?.toFixed(2) + '%'

  const handleItemsPerPageChange = (e) => {
    setFilters({...filters, page: 1, items_per_page: e.target.value})
  }

  const previousPage = () => {
    setFilters({...filters, page: filters.page - 1})
  }

  const nextPage = () => {
    setFilters({...filters, page: filters.page + 1})
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 lg:p-24 space-y-4 max-w-max mx-auto">
      <div className="flex flex-row flex-wrap gap-4 justify-center">
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AirportFilter  {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AirlineFilter  {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <CountryFilter  {...{closePopover, setBreakdown, setFilters, setConfig}} />}/>
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <AircraftFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />}/>
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <DateFilter     {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <ClassFilter    {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
        <BaseFilter setFilters={setFilters} component={(closePopover, setBreakdown, setConfig) => <GroupingFilter {...{closePopover, setBreakdown, setFilters, setConfig}} />} />
      </div>

      <table className='border-spacing-2 text-center border border-separate border-white'>
        <thead>
          <TableHeader filters={filters} setFilters={setFilters} />
        </thead>
        <tbody>
          {data.routes && data.routes.map((route) => (
            <tr>
              {filters.group_by.includes("carrier") && <td><dfn title={airlineCodes[route.carrier]}>{route.carrier}</dfn></td>}
              {filters.group_by.includes("aircraft_type") && <td>{aircraftCodes[route.aircraft_type] || route.aircraft_type} ({route.aircraft_type})</td>}
              {filters.group_by.includes("origin") && <td>{route.origin}</td>}
              {filters.group_by.includes("dest") && <td>{route.dest}</td>}
              {filters.group_by.includes("origin_country") && <td>{route.origin_country}</td>}
              {filters.group_by.includes("dest_country") && <td>{route.dest_country}</td>}
              {filters.group_by.includes("month") && <td>{route.month?.substring(0, 7)}</td>}
              {filters.group_by.includes("quarter") && <td>{route.quarter?.substring(0, 4)} {quarterMap[route.quarter?.substring(5, 7)]}</td>}
              {filters.group_by.includes("year") && <td>{route.year?.substring(0, 4)}</td>}
              <td>{formatNumber(route.departures_performed)}</td>
              <td>{formatNumber(route.seats)} ({formatNumber(Math.round(route.seats / route.departures_performed))})</td>
              <td className="hidden md:block">{formatNumber(route.asms)}</td>
              <td>{formatNumber(route.passengers)} ({formatNumber(Math.round(route.passengers / route.departures_performed))})</td>
              <td className="hidden md:block">{formatNumber(route.rpms)}</td>
              <td>{getFormattedLoadFactor(route.load_factor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex w-full justify-between items-center">
        <select value={filters.items_per_page} onChange={handleItemsPerPageChange} className="w-36 text-sm m-0 text-white p-2 pr-6 rounded-md border-r-4 border-transparent outline outline-gray-300 hover:outline-gray-100 bg-transparent cursor-pointer">
            <option value="20">20 per page</option>
            <option value="40">40 per page</option>
            <option value="60">60 per page</option>
            <option value="80">80 per page</option>
        </select>
        <div className="text-center text-sm">
          <p>Page {filters.page} of {data.total_pages}</p>
          <p>{data.total_items} total results</p>
          {dateRange.from_date && <p class="text-[10px] mt-2">Data available to query: {dayjs(dateRange.from_date).format("MMM YYYY")} to {dayjs(dateRange.to_date).format("MMM YYYY")}</p>}
        </div>
        <div className="space-x-4">
          <PagingButton disabled={filters.page == 1} onClick={previousPage}>Previous</PagingButton>
          <PagingButton disabled={filters.page == data.total_pages} onClick={nextPage}>Next</PagingButton>
        </div>
      </div>
     </main>
  )
}

const PagingButton = ({ children, ...props}) => {
  return <button {...props} className="border border-gray-300 hover:border-gray-100 disabled:border-gray-500 disabled:text-gray-500 disabled:cursor-not-allowed rounded-md py-2 px-4 uppercase tracking-wider text-gray-300 hover:text-gray-100 text-sm" >
    {children}
  </button>
}

const TableHeader = ( { filters, setFilters }) => {
  const addSortToFilter = (col) => {
    if (filters.order_by == col.key) {
      setFilters({...filters, order_dir: filters.order_dir == "desc" ? "asc" : "desc", page: 1})
    } else {
      setFilters({...filters, order_by: col.key, page: 1})
    }
  }

  return (
    <tr>
      {groupingHeaders.filter((col) => filters.group_by.includes(col.key)).map((col, i) => (
        <th key={i} onClick={() => addSortToFilter(col)} className={`cursor-pointer align-text-top ${col.className}`}>
          {col.value}
          {col.key == filters.order_by && filters.order_dir == "desc" && <i className="fa fa-chevron-down scale-75 pl-1"></i>}
          {col.key == filters.order_by && filters.order_dir == "asc" && <i className="fa fa-chevron-up scale-75 pl-1"></i>}
        </th>
      ))}
      {columnHeaders.map((col, i) => (
        <th key={i} onClick={() => addSortToFilter(col)} className={`cursor-pointer align-text-top ${col.className}`}>
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
  const [isBidirectional, setIsBidirectional] = useState(false)

  const applyFilter = () => {
    closePopover()
    setBreakdown(`${originAirport} ${isBidirectional ? "<->" : "-"} ${destAirport}`)
    setFilters((f) => ({...f, origin: originAirport, dest: destAirport, bidirectional: isBidirectional}))
  }

  const flipOriginDest = () => {
    setOriginAirport(destAirport)
    setDestAirport(originAirport)
  }

  useEffect(() => setConfig({name: "Airport", keys: ["origin", "dest", "bidirectional"]}), [])

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

const CountryFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [originCountry, setOriginCountry] = useState("US")
  const [destCountry, setDestCountry] = useState("GB")

  const applyFilter = () => {
    closePopover()
    setBreakdown(`${originCountry} - ${destCountry}`)
    setFilters((f) => ({...f, origin_country: originCountry, dest_country: destCountry}))
  }

  useEffect(() => {setConfig({name: "Country", keys: ["origin_country", "dest_country"]}); setBreakdown("US - GB")}, [])

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
  const [airlines, setAirlines] = useState([])
  const [inputAirline, setInputAirline] = useState("")

  const applyFilter = () => {
    let newAirlines = [...airlines, inputAirline].filter((a) => a != "")
    setAirlines(newAirlines)
    setBreakdown(newAirlines.join(", "))
    setFilters((f) => ({ ...f, carrier: newAirlines}))
    setInputAirline("")
  }

  const removeAirline = (i) => {
    let newAirlines = airlines.filter((_, j) => j != i)
    setAirlines(newAirlines)
    setBreakdown(newAirlines.join(", "))
    setFilters((f) => ({ ...f, carrier: newAirlines}))
  }

  useEffect(() => setConfig({name: "Airline", keys: ["carrier"]}), [])

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
  const [dropdownChoice, setDropdownChoice] = useState("last_x")

  const [timePeriod, setTimePeriod] = useState(1)
  const [timeDropdownChoice, setTimeDropdownChoice] = useState("years")
  
  const [firstDate, setFirstDate] = useState(null)
  const [secondDate, setSecondDate] = useState(null)

  const applyFilter = () => {
    setFilters((f) => {
      const outFilters = {...f, from_date: null, to_date: null}

      if (dropdownChoice == "between") {
        outFilters.from_date = firstDate
        outFilters.to_date = secondDate
        setBreakdown(`${firstDate} to ${secondDate}`)
      } else if (dropdownChoice == "equal") {
        outFilters.from_date = firstDate
        outFilters.to_date = firstDate
        setBreakdown(`${firstDate}`)
      } else if (dropdownChoice == "after") {
        outFilters.from_date = firstDate
        setBreakdown(`Starting from ${firstDate}`)
      } else if (dropdownChoice == "before") {
        outFilters.to_date = secondDate
        setBreakdown(`Ending on ${secondDate}`)
      } else if (dropdownChoice == "last_x") {
        outFilters.from_date = dayjs().subtract(timePeriod, timeDropdownChoice).toISOString().split("T")[0]
        setBreakdown(`Last ${timePeriod == 1 ? "" : timePeriod} ${timePeriod == 1 ? timeDropdownChoice.slice(0, -1) : timeDropdownChoice}`)
      }

      return outFilters
    })

    closePopover()
  }

  useEffect(() => {setConfig({name: "Date", keys: ["from_date", "to_date"]}); setBreakdown("Starting from 2023-01-01")}, [])

  return (
    <>
      <span>Filter by Date</span>
      <select value={dropdownChoice} onChange={(e) => setDropdownChoice(e.target.value)} className="border p-2">
        <option value="between">is between</option>
        <option value="last_x">is in the last</option>
        <option value="equal">is equal to</option>
        <option value="after">is on or after</option>
        <option value="before">is before or on</option>
      </select>
      <div className="flex flex-row items-center">
        <i className="fa fa-share-fa pr-2 pl-1 text-blue-400 -scale-y-100 scale-x-125"></i>
        {dropdownChoice == "last_x" && <div className="space-x-2">
          <input type="text" className="border text-sm p-2 w-20" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}/>
          <select value={timeDropdownChoice} onChange={(e) => setTimeDropdownChoice(e.target.value)} className="border p-2 w-28">
            <option value="months">months</option>
            <option value="years">years</option>
          </select>
        </div>}
        {["equal", "between", "after"].includes(dropdownChoice) && <input type="date" className="border p-2 text-sm" onChange={(e) => setFirstDate(e.target.value)}/>} 
        {dropdownChoice == "between" && <span className="px-2">and</span>}
        {["between", "before"].includes(dropdownChoice) && <input type="date" className="border p-2 text-sm" onChange={(e) => setSecondDate(e.target.value)}/>}        
      </div>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  )
}

const ClassFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [serviceClass, setServiceClass] = useState('')

  const applyFilter = () => {
    closePopover()
    setBreakdown(serviceClass)
    setFilters((f) => ({ ...f, service_class: serviceClass}))
  }

  useEffect(() => setConfig({name: "Class", keys: ["service_class"]}), [])

  return (
    <>
      <span>Filter by Class</span>
      <input type="text" placeholder="T-100 class" value={serviceClass} onChange={(e) => setServiceClass(e.target.value)} className="border p-2"/>
      <button className='bg-green-500 p-2 text-white rounded-md' onClick={applyFilter}>Apply</button>
    </>
  ) 
}

const GroupingFilter = ({ closePopover, setBreakdown, setFilters, setConfig }) => {
  const [byAirline, setByAirline] = useState(true)
  const [byAircraft, setByAircraft] = useState(false)
  const [byOriginAirport, setByOriginAirport] = useState(false)
  const [byDestAirport, setByDestAirport] = useState(false)
  const [byOriginCountry, setByOriginCountry] = useState(false)
  const [byDestCountry, setByDestCountry] = useState(false)
  const [byYear, setByYear] = useState(false)
  const [byQuarter, setByQuarter] = useState(false)
  const [byMonth, setByMonth] = useState(false)

  const applyFilter = () => {
    const breakdown = []
    const groupBy = []

    if (byAirline) {
      breakdown.push("Airline");
      groupBy.push("carrier");
    }

    if (byAircraft) {
      breakdown.push("Aircraft Type");
      groupBy.push("aircraft_type");
    }

    if (byOriginAirport) {
      breakdown.push("Origin Airport");
      groupBy.push("origin");
    }

    if (byDestAirport) {
      breakdown.push("Destination Airport");
      groupBy.push("dest");
    }
    
    if (byOriginCountry) {
      breakdown.push("Origin Country");
      groupBy.push("origin_country");
    }

    if (byDestCountry) {
      breakdown.push("Destination Country");
      groupBy.push("dest_country");
    }

    if (byYear) {
      breakdown.push("Year");
      groupBy.push("year");
    }

    if (byQuarter) {
      breakdown.push("Quarter");
      groupBy.push("quarter");
    }

    if (byMonth) {
      breakdown.push("Month");
      groupBy.push("month");
    }

    closePopover()
    setBreakdown(breakdown.join(", "))
    setFilters((f) => ({ ...f, group_by: groupBy}))
  }

  useEffect(() => {setConfig({name: "Group by", keys: ["group_by"]}); setBreakdown("Airline")}, [])

  return (
    <>
      <span>Group by</span>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="airline" name="airline" value="airline" checked={byAirline} onChange={(e) => setByAirline(!byAirline)}/>
        <label for="airline">Airline</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="aircraft_type" name="aircraft_type" value="aircraft_type" checked={byAircraft} onChange={(e) => setByAircraft(!byAircraft)}/>
        <label for="aircraft_type">Aircraft type</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="origin" name="origin" value="origin" checked={byOriginAirport} onChange={(e) => setByOriginAirport(!byOriginAirport)}/>
        <label for="origin">Origin airport</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="dest" name="dest" value="dest" checked={byDestAirport} onChange={(e) => setByDestAirport(!byDestAirport)}/>
        <label for="dest">Destination airport</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="origin_country" name="origin_country" value="origin_country" checked={byOriginCountry} onChange={(e) => setByOriginCountry(!byOriginCountry)}/>
        <label for="origin_country">Origin country</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="dest_country" name="dest_country" value="dest_country" checked={byDestCountry} onChange={(e) => setByDestCountry(!byDestCountry)}/>
        <label for="dest_country">Destination country</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="year" name="year" value="year" checked={byYear} onChange={(e) => setByYear(!byYear)}/>
        <label for="year">Year</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="quarter" name="quarter" value="quarter" checked={byQuarter} onChange={(e) => setByQuarter(!byQuarter)}/>
        <label for="quarter">Quarter</label>
      </div>
      <div className="flex flex-row space-x-2">
        <input type="checkbox" id="month" name="month" value="month" checked={byMonth} onChange={(e) => setByMonth(!byMonth)}/>
        <label for="month">Month</label>
      </div>
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
      if (config.keys.includes("group_by")) {
        outFilters["group_by"] = []
      }
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