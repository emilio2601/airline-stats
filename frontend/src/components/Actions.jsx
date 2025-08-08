import React, { useState } from 'react';
import WfPopover from './wf_popover';
import ShareTab from './ShareTab';
import ExportTab from './ExportTab';

const Actions = ({ filters, onExport }) => {
  const [activeTab, setActiveTab] = useState('share');

  return (
    <WfPopover trigger={"click"} placement="bottom-end" color="white">
      <WfPopover.Trigger>
        <button className="text-coolgray-700 font-medium flex w-max rounded-full border border-coolgray-400 border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 items-center" title="Share & export">
          <i className="fa fa-share-nodes pr-1.5"></i>
          <span>Share</span>
        </button>
      </WfPopover.Trigger>
      <WfPopover.Container>
        <div className="flex flex-col text-sm space-y-4 text-gray-900 w-80">
          <div className="flex justify-stretch border-b">
            <button
              className={`px-4 py-2 text-base ${activeTab === 'share' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('share')}
            >
              Save/Share
            </button>
            <button
              className={`px-4 py-2 text-base ${activeTab === 'export' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('export')}
            >
              Export
            </button>
          </div>
          <div className="px-1 pb-2">
            {activeTab === 'share' && <ShareTab filters={filters} />}
            {activeTab === 'export' && <ExportTab onExport={onExport} />}
          </div>
        </div>
      </WfPopover.Container>
    </WfPopover>
  );
};

export default Actions;
