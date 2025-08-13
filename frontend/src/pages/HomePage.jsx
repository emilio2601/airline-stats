import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';

import { aircraftCodes } from '../data/aircraft_codes';
import { airlineCodes } from '../data/airline_codes';
import useLocalStorage from '../hooks/useLocalStorage';
import PagingButton from '../components/PagingButton';
import TableHeader from '../components/TableHeader';
import AirportFilter from '../components/filters/AirportFilter';
import CountryFilter from '../components/filters/CountryFilter';
import DateFilter from '../components/filters/DateFilter';
import BaseFilter from '../components/BaseFilter';
import ViewSettings from '../components/ViewSettings';
import Actions from '../components/Actions';
import MoreFilters from '../components/MoreFilters';

const quarterMap = {
  "01": "Q1",
  "04": "Q2",
  "07": "Q3",
  "10": "Q4"
}

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

export default function HomePage({ initialFilters, savedSearch }) {
  const defaultFilters = {page: 1, items_per_page: 20, order_by: "seats", order_dir: "desc", group_by: ["carrier"], origin_country: "US", dest_country: "GB", from_date: "2023-01-01"};

  const [data, setData] = useState({});
  const [dateRange, setDateRange] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters || defaultFilters);
  const [isSavedSearchView, setIsSavedSearchView] = useState(!!savedSearch);
  
  const [visibleColumns, setVisibleColumns] = useLocalStorage(
    'visibleColumns',
    columnHeaders.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  const [formattingOptions, setFormattingOptions] = useLocalStorage('formattingOptions', {
    showPerFlightAverage: true,
    rounding: 'none',
    decimalPrecision: 0,
  });

  const handleFilterChange = (newFilters) => {
    // This is a data-consistency guard. It ensures that if we are sorting by a
    // column, that column must be part of the 'group by' clause. If it's not,
    // we reset the sort to a default value to prevent an invalid API request.
    const resolvedFilters = typeof newFilters === 'function' ? newFilters(filters) : newFilters;
    
    let correctedFilters = { ...resolvedFilters };
    if (groupingHeaders.map((col) => col.key).includes(correctedFilters.order_by) && !correctedFilters.group_by?.includes(correctedFilters.order_by)) {
      correctedFilters = { ...correctedFilters, order_by: "seats", order_dir: "desc" };
    }
    
    // If we were viewing a saved search, this indicates the user is now modifying it.
    if (isSavedSearchView) {
      setIsSavedSearchView(false);
    }

    setFilters(correctedFilters);
  };

  const baseURL = "/api";

  const fetchRoutes = async (controller) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseURL}/routes`, {
        params: filters,
        signal: controller.signal,
      });
      setData(response.data);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request canceled:", error.message);
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchRoutes(controller);

    return () => {
      controller.abort();
    };
  }, [filters]);

  useEffect(() => {
    const fetchDateRange = async () => {
      const res = await axios.get(`${baseURL}/routes/date_range`)
      setDateRange(res.data)
    }
    fetchDateRange();
  }, [])

  const formatNumber = (number) => {
    const precision = formattingOptions.decimalPrecision;
    const numberFormatOptions = {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    };

    if (formattingOptions.rounding === 'auto') {
        if (number >= 1_000_000_000) return Intl.NumberFormat(undefined, numberFormatOptions).format(number / 1_000_000_000) + 'B';
        if (number >= 1_000_000) return Intl.NumberFormat(undefined, numberFormatOptions).format(number / 1_000_000) + 'M';
        if (number >= 1_000) return Intl.NumberFormat(undefined, numberFormatOptions).format(number / 1_000) + 'K';
    }
    if (formattingOptions.rounding === 'B' && number >= 1_000_000_000) {
      const value = number / 1_000_000_000;
      return Intl.NumberFormat(undefined, numberFormatOptions).format(value) + 'B';
    }
    if (formattingOptions.rounding === 'M' && number >= 1_000_000) {
      const value = number / 1_000_000;
      return Intl.NumberFormat(undefined, numberFormatOptions).format(value) + 'M';
    }
    if (formattingOptions.rounding === 'K' && number >= 1_000) {
      const value = number / 1_000;
      return Intl.NumberFormat(undefined, numberFormatOptions).format(value) + 'K';
    }
    return Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(number);
  };

  const getFormattedLoadFactor = (lf) => {
    const value = lf * 100;
    return Intl.NumberFormat(undefined, {
      minimumFractionDigits: formattingOptions.decimalPrecision,
      maximumFractionDigits: formattingOptions.decimalPrecision,
    }).format(value) + '%';
  }

  const handleItemsPerPageChange = (e) => {
    handleFilterChange({...filters, page: 1, items_per_page: e.target.value})
  }

  const previousPage = () => {
    handleFilterChange({...filters, page: filters.page - 1})
  }

  const nextPage = () => {
    handleFilterChange({...filters, page: filters.page + 1})
  }

  const handleExport = () => {
    const visibleColumnKeys = Object.keys(visibleColumns).filter(key => visibleColumns[key]);
    const exportFilters = { ...filters, visible_columns: visibleColumnKeys, per_flight: formattingOptions.showPerFlightAverage };

    const csvUrl = axios.getUri({
      url: `${baseURL}/routes.csv`,
      params: exportFilters,
    });
    
    window.open(csvUrl, '_blank');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 lg:p-24 space-y-4 max-w-max mx-auto">
      {isSavedSearchView && savedSearch && (
        <div className="w-full bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative" role="alert">
          <strong className="font-bold">Viewing Saved Search</strong>
          {savedSearch.search_name && <span className="block sm:inline">: {savedSearch.search_name}</span>}
        </div>
      )}
      <div className={`flex flex-row flex-wrap gap-4 justify-center transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <BaseFilter setFilters={handleFilterChange} filters={filters} component={AirportFilter} />
        <BaseFilter setFilters={handleFilterChange} filters={filters} component={CountryFilter} />
        <BaseFilter setFilters={handleFilterChange} filters={filters} component={DateFilter} />
        <MoreFilters filters={filters} setFilters={handleFilterChange} />
        <ViewSettings 
          filters={filters} 
          setFilters={handleFilterChange} 
          visibleColumns={visibleColumns} 
          setVisibleColumns={setVisibleColumns} 
          formattingOptions={formattingOptions}
          setFormattingOptions={setFormattingOptions}
        />
        <Actions filters={filters} onExport={handleExport} />
      </div>

      <table className={`border-spacing-2 text-center border border-separate border-white w-full transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <thead>
          <TableHeader filters={filters} setFilters={handleFilterChange} visibleColumns={visibleColumns} formattingOptions={formattingOptions} />
        </thead>
        <tbody>
          {data.routes && data.routes.map((route, idx) => {
            const aircraft = route.aircraft_type ? aircraftCodes.find(a => a.code == route.aircraft_type) : null;
            const aircraftName = aircraft ? `${aircraft.name} ${aircraft.icao ? `(${aircraft.icao.join(', ')})` : ''}` : route.aircraft_type;
            
            const keyBase = filters.group_by.map(col => (route[col] ?? '')).join('-');
            const key = `${keyBase}-${idx}`;
            
            return (
              <tr key={key}>
                {filters.group_by?.includes("carrier") && <td><dfn title={airlineCodes[route.carrier]}>{route.carrier}</dfn></td>}
                {filters.group_by?.includes("aircraft_type") && <td>{aircraftName}</td>}
                {filters.group_by?.includes("origin") && <td>{route.origin}</td>}
                {filters.group_by?.includes("dest") && <td>{route.dest}</td>}
                {filters.group_by?.includes("origin_country") && <td>{route.origin_country}</td>}
                {filters.group_by?.includes("dest_country") && <td>{route.dest_country}</td>}
                {filters.group_by?.includes("month") && <td>{route.month?.substring(0, 7)}</td>}
                {filters.group_by?.includes("quarter") && <td>{route.quarter?.substring(0, 4)} {quarterMap[route.quarter?.substring(5, 7)]}</td>}
                {filters.group_by?.includes("year") && <td>{route.year?.substring(0, 4)}</td>}
                {visibleColumns.departures_performed && <td>{formatNumber(route.departures_performed)}</td>}
                {visibleColumns.seats && <td>{formatNumber(route.seats)} {formattingOptions.showPerFlightAverage && route.seats_per_flight != null && `(${formatNumber(route.seats_per_flight)})`}</td>}
                {visibleColumns.asms && <td className="hidden md:block">{formatNumber(route.asms)}</td>}
                {visibleColumns.passengers && <td>{formatNumber(route.passengers)} {formattingOptions.showPerFlightAverage && route.passengers_per_flight != null && `(${formatNumber(route.passengers_per_flight)})`}</td>}
                {visibleColumns.rpms && <td className="hidden md:block">{formatNumber(route.rpms)}</td>}
                {visibleColumns.load_factor && <td>{getFormattedLoadFactor(route.load_factor)}</td>}
              </tr>
            )
          })}
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
          {dateRange.from_date && <p className="text-[10px] mt-2">Data available to query: {dayjs(dateRange.from_date).format("MMM YYYY")} to {dayjs(dateRange.to_date).format("MMM YYYY")}</p>}
          <p className="text-[10px]">Contact <a href="mailto:info@airlinestats.io" className="text-blue-500">info@airlinestats.io</a> for any questions or feedback</p>
        </div>
        <div className="space-x-4">
          <PagingButton disabled={filters.page == 1} onClick={previousPage}>Previous</PagingButton>
          <PagingButton disabled={filters.page == data.total_pages} onClick={nextPage}>Next</PagingButton>
        </div>
      </div>
     </main>
  )
} 