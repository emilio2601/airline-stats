import React from 'react';
import WfPopover from './wf_popover';
import BaseFilter from './BaseFilter';
import AirlineFilter from './filters/AirlineFilter';
import AircraftFilter from './filters/AircraftFilter';
import ClassFilter, { serviceClassMap } from './filters/ClassFilter';
import { aircraftCodes } from '../data/aircraft_codes';

const MoreFilters = ({ filters, setFilters }) => {
  const airlineSummary = (filters.carrier && filters.carrier.length > 0)
    ? `Airline: ${filters.carrier.slice(0,2).join(', ')}${filters.carrier.length > 2 ? '…' : ''}`
    : null;
  const aircraftSummary = (() => {
    if (!filters.aircraft_type) return null;
    const ac = aircraftCodes.find(a => a.code === filters.aircraft_type);
    const icao = ac?.icao?.[0];
    return `Aircraft: ${icao || filters.aircraft_type}`;
  })();
  const classSummary = filters.service_class ? `Class: ${serviceClassMap[filters.service_class] || filters.service_class}` : null;
  const activeSummaries = [airlineSummary, aircraftSummary, classSummary].filter(Boolean);
  const activeCount = activeSummaries.length;
  const hasActive = activeCount > 0;
  const summaryTitle = hasActive ? activeSummaries.join(' | ') : 'More Filters';

  return (
    <WfPopover trigger={"click"} placement="bottom-start" color="white">
      <WfPopover.Trigger>
        <button className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center" title={summaryTitle}>
          <i className="fa fa-filter pr-1.5"></i>
          <span>More Filters</span>
          {hasActive && (
            <>
              <span className="mx-1.5">|</span>
              <span className="text-blue-400">{activeCount} active</span>
            </>
          )}
        </button>
      </WfPopover.Trigger>
      <WfPopover.Container>
        <div className="flex flex-col text-sm text-gray-900 p-4">
          <BaseFilter setFilters={setFilters} filters={filters} component={AirlineFilter} dark/>
          <div className="mt-3"></div>
          <BaseFilter setFilters={setFilters} filters={filters} component={AircraftFilter} dark/>
          <div className="mt-3" ></div>
          <BaseFilter setFilters={setFilters} filters={filters} component={ClassFilter} dark/>
        </div>
      </WfPopover.Container>
    </WfPopover>
  );
};

export default MoreFilters; 