import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const DateFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters }) => {
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
        setBreakdown(`From ${firstDate}`)
      } else if (dropdownChoice == "before") {
        outFilters.to_date = secondDate
        setBreakdown(`To ${secondDate}`)
      } else if (dropdownChoice == "last_x") {
        outFilters.from_date = dayjs().subtract(timePeriod, timeDropdownChoice).toISOString().split("T")[0]
        setBreakdown(`Last ${timePeriod == 1 ? "" : timePeriod} ${timePeriod == 1 ? timeDropdownChoice.slice(0, -1) : timeDropdownChoice}`)
      }

      return outFilters
    })

    closePopover()
  }

  useEffect(() => {
    setConfig({name: "Date", keys: ["from_date", "to_date"]});
    
    if (filters.from_date && filters.to_date && filters.from_date === filters.to_date) {
      setBreakdown(filters.from_date)
    } else if (filters.from_date && filters.to_date) {
      setBreakdown(`${filters.from_date} to ${filters.to_date}`)
    } else if (filters.from_date) {
      setBreakdown(`From ${filters.from_date}`)
    } else if (filters.to_date) {
      setBreakdown(`To ${filters.to_date}`)
    } else {
      setBreakdown(null)
    }
    // Note: We don't synchronize the complex internal state of this component,
    // only the breakdown display. A full sync would require more complex logic.
  }, [filters.from_date, filters.to_date, setConfig, setBreakdown])

  return (
    <>
      <span className="font-bold text-base">Filter by Date</span>
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

export default DateFilter; 