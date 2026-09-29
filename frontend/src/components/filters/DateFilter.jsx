import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

const DateFilter = ({ closePopover, setBreakdown, setFilters, setConfig, filters, latestAvailableMonth }) => {
  const [dropdownChoice, setDropdownChoice] = useState("last_x")

  const [timePeriod, setTimePeriod] = useState(1)
  const [timeDropdownChoice, setTimeDropdownChoice] = useState("years")
  
  // Month-based strings in canonical YYYY-MM
  const [firstMonth, setFirstMonth] = useState('')
  const [secondMonth, setSecondMonth] = useState('')
  const [supportsMonth, setSupportsMonth] = useState(true)
  const relativeRange = useRef(null)

  const normalizeMonth = (value) => {
    if (!value) return ''
    let v = String(value).trim()
    v = v.replace(/[./\\]/g, '-')
    // Accept MM-YYYY
    const mmYYYY = /^(\d{1,2})-([12]\d{3})$/
    const m1 = v.match(mmYYYY)
    if (m1 && Number(m1[1]) >= 1 && Number(m1[1]) <= 12) {
      const m = m1[1].padStart(2, '0')
      const y = m1[2]
      return `${y}-${m}`
    }
    // Accept YYYY-MM
    const yyyyMM = /^([12]\d{3})-(\d{1,2})$/
    const m2 = v.match(yyyyMM)
    if (m2 && Number(m2[2]) >= 1 && Number(m2[2]) <= 12) {
      const y = m2[1]
      const m = m2[2].padStart(2, '0')
      return `${y}-${m}`
    }
    return ''
  }

  const computeBreakdown = (from, to) => {
    if (from && to && from.slice(0, 7) === to.slice(0, 7)) return dayjs(from).format('MMM YYYY')
    if (from && to) return `${dayjs(from).format('MMM YYYY')} to ${dayjs(to).format('MMM YYYY')}`
    if (from) return `From ${dayjs(from).format('MMM YYYY')}`
    if (to) return `To ${dayjs(to).format('MMM YYYY')}`
    return null
  }

  const normalizedFirstMonth = normalizeMonth(firstMonth)
  const normalizedSecondMonth = normalizeMonth(secondMonth)
  const validPeriod = /^[1-9]\d*$/.test(String(timePeriod)) && Number(timePeriod) <= 100
  const canApply = dropdownChoice === 'last_x' ? validPeriod
    : dropdownChoice === 'between' ? Boolean(normalizedFirstMonth && normalizedSecondMonth && normalizedFirstMonth <= normalizedSecondMonth)
      : dropdownChoice === 'before' ? Boolean(normalizedSecondMonth) : Boolean(normalizedFirstMonth)
  const validationMessage = dropdownChoice === 'last_x' ? 'Enter a number from 1 to 100.'
    : dropdownChoice === 'between' && normalizedFirstMonth && normalizedSecondMonth ? 'Start month can’t be after end month.'
      : 'Choose a valid month.'

  // Feature-detect native month input; keeps UI simple while ensuring graceful fallback
  useEffect(() => {
    try {
      const input = document.createElement('input')
      input.setAttribute('type', 'month')
      setSupportsMonth(input.type === 'month')
    } catch {
      setSupportsMonth(false)
    }
  }, [])

  const applyFilter = () => {
    if (!canApply) return

    const dates = { from_date: null, to_date: null }
    if (dropdownChoice === 'between') {
      dates.from_date = `${normalizedFirstMonth}-01`
      dates.to_date = dayjs(`${normalizedSecondMonth}-01`).endOf('month').format('YYYY-MM-DD')
    } else if (dropdownChoice === 'equal') {
      dates.from_date = `${normalizedFirstMonth}-01`
      dates.to_date = dates.from_date
    } else if (dropdownChoice === 'after') {
      dates.from_date = `${normalizedFirstMonth}-01`
    } else if (dropdownChoice === 'before') {
      dates.to_date = dayjs(`${normalizedSecondMonth}-01`).endOf('month').format('YYYY-MM-DD')
    } else {
      const latestMonth = dayjs(latestAvailableMonth || undefined).startOf('month')
      const months = timeDropdownChoice === 'months' ? Number(timePeriod) : Number(timePeriod) * 12
      dates.from_date = latestMonth.subtract(months - 1, 'month').format('YYYY-MM-DD')
      dates.to_date = latestMonth.endOf('month').format('YYYY-MM-DD')
      const unit = Number(timePeriod) === 1 ? timeDropdownChoice.slice(0, -1) : timeDropdownChoice
      relativeRange.current = { ...dates, label: `Last ${Number(timePeriod) === 1 ? '' : `${timePeriod} `}${unit}` }
    }

    if (dropdownChoice !== 'last_x') relativeRange.current = null
    setBreakdown(relativeRange.current?.label || computeBreakdown(dates.from_date, dates.to_date))
    setFilters((current) => ({ ...current, ...dates }))

    closePopover()
  }

  useEffect(() => {
    setConfig({name: "Date", keys: ["from_date", "to_date"]});
    const from = filters.from_date
    const to = filters.to_date
    if (relativeRange.current?.from_date === from && relativeRange.current?.to_date === to) {
      setBreakdown(relativeRange.current.label)
      return
    }
    relativeRange.current = null
    setFirstMonth(from?.slice(0, 7) || '')
    setSecondMonth(to?.slice(0, 7) || '')
    setDropdownChoice(from && to ? (from.slice(0, 7) === to.slice(0, 7) ? 'equal' : 'between') : from ? 'after' : to ? 'before' : 'last_x')
    setBreakdown(computeBreakdown(from, to))
  }, [filters.from_date, filters.to_date, setConfig, setBreakdown])

  return (
    <>
      <span className="font-bold text-base">Date</span>
      <select value={dropdownChoice} onChange={(e) => setDropdownChoice(e.target.value)} className="border p-2">
        <option value="between">Between</option>
        <option value="last_x">Last</option>
        <option value="equal">In</option>
        <option value="after">From</option>
        <option value="before">Through</option>
      </select>
      <div className="flex flex-row items-stretch justify-between w-[20rem] max-w-full space-x-2">
        {dropdownChoice == "last_x" && <>
          <input type="text" className="border text-sm p-2 w-full" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}/>
          <select value={timeDropdownChoice} onChange={(e) => setTimeDropdownChoice(e.target.value)} className="border text-sm p-2 w-full">
            <option value="months">months</option>
            <option value="years">years</option>
          </select>
        </>}
        {dropdownChoice !== 'between' && ["equal", "after", "before"].includes(dropdownChoice) && (
          supportsMonth ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              <input
                type="month"
                className="border p-2 text-sm col-span-2"
                value={(dropdownChoice === 'before' ? secondMonth : firstMonth)}
                onChange={(e) => (dropdownChoice === 'before' ? setSecondMonth(e.target.value) : setFirstMonth(e.target.value))}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full">
              <input
                type="text"
                inputMode="numeric"
                pattern="\\d{4}-\\d{2}"
                placeholder="YYYY-MM"
                className="border p-2 text-sm col-span-2"
                value={(dropdownChoice === 'before' ? secondMonth : firstMonth)}
                onChange={(e) => (dropdownChoice === 'before' ? setSecondMonth(e.target.value) : setFirstMonth(e.target.value))}
              />
            </div>
          )
        )}

        {dropdownChoice === 'between' && (
          supportsMonth ? (
            <div className="grid grid-cols-2 gap-2 w-full">
              <input type="month" className="border p-2 text-sm w-full" value={firstMonth} onChange={(e) => setFirstMonth(e.target.value)}/>
              <input type="month" className="border p-2 text-sm w-full" value={secondMonth} onChange={(e) => setSecondMonth(e.target.value)}/>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full">
              <input
                type="text"
                inputMode="numeric"
                pattern="\\d{4}-\\d{2}"
                placeholder="YYYY-MM"
                className="border p-2 text-sm w-full"
                value={firstMonth}
                onChange={(e) => setFirstMonth(e.target.value)}
              />
              <input
                type="text"
                inputMode="numeric"
                pattern="\\d{4}-\\d{2}"
                placeholder="YYYY-MM"
                className="border p-2 text-sm w-full"
                value={secondMonth}
                onChange={(e) => setSecondMonth(e.target.value)}
              />
            </div>
          )
        )}
      </div>
      {!canApply && <span className="text-red-600 text-xs" role="alert">{validationMessage}</span>}
      <button className='bg-green-500 p-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed' disabled={!canApply} onClick={applyFilter}>Apply</button>
    </>
  )
}

export default DateFilter;
