import React from 'react';

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

const TableHeader = ( { filters, setFilters, visibleColumns, formattingOptions }) => {
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
      {columnHeaders.filter(col => visibleColumns[col.key]).map((col, i) => {
        let { value } = col;
        if (!formattingOptions.showPerFlightAverage) {
          value = value.replace(" (per flight)", "");
        }
        return (
          <th key={i} onClick={() => addSortToFilter(col)} className={`cursor-pointer align-text-top ${col.className}`}>
            {value}
            {col.key == filters.order_by && filters.order_dir == "desc" && <i className="fa fa-chevron-down scale-75 pl-1"></i>}
            {col.key == filters.order_by && filters.order_dir == "asc" && <i className="fa fa-chevron-up scale-75 pl-1"></i>}
          </th>
        )
      })}
    </tr>
  )
}

export default TableHeader; 