import React, { useState } from 'react';
import WfPopover from './wf_popover';
import GroupingTab from './GroupingTab';
import ColumnsTab from './ColumnsTab';
import FormattingTab from './FormattingTab';

const ViewSettings = ({ filters, setFilters, visibleColumns, setVisibleColumns, formattingOptions, setFormattingOptions }) => {
  const [activeTab, setActiveTab] = useState('grouping');

  return (
    <WfPopover trigger={"click"} placement="bottom-end" color="white">
      <WfPopover.Trigger>
        <button className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center" title="View settings">
          <i className="fa fa-sliders pr-1.5"></i>
          <span>View</span>
        </button>
      </WfPopover.Trigger>
      <WfPopover.Container>
        <div className="flex flex-col text-sm space-y-4 text-gray-900 w-80">
          <div className="flex justify-between border-b">
            <button
              className={`px-4 py-2 text-base ${activeTab === 'grouping' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('grouping')}
            >
              Grouping
            </button>
            <button
              className={`px-4 py-2 text-base ${activeTab === 'columns' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('columns')}
            >
              Columns
            </button>
            <button
              className={`px-4 py-2 text-base ${activeTab === 'formatting' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('formatting')}
            >
              Formatting
            </button>
          </div>
          <div className="px-1 pb-2">
            {activeTab === 'grouping' && <GroupingTab filters={filters} setFilters={setFilters} />}
            {activeTab === 'columns' && <ColumnsTab visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns} />}
            {activeTab === 'formatting' && <FormattingTab formattingOptions={formattingOptions} setFormattingOptions={setFormattingOptions} />}
          </div>
        </div>
      </WfPopover.Container>
    </WfPopover>
  );
};

export default ViewSettings; 