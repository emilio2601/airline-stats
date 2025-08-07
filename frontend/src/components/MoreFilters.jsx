import React, { useState } from 'react';
import WfPopover from './wf_popover';
import BaseFilter from './BaseFilter';
import AirlineFilter from './filters/AirlineFilter';
import AircraftFilter from './filters/AircraftFilter';
import ClassFilter from './filters/ClassFilter';

const MoreFilters = ({ filters, setFilters }) => {
  return (
    <WfPopover trigger={"click"} placement="bottom-start" color="white">
      <WfPopover.Trigger>
        <button className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center">
          <i className="fa fa-filter pr-1.5"></i>
          <span>More Filters</span>
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