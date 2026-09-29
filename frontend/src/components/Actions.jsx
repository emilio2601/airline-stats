import React from 'react';
import WfPopover from './wf_popover';
import ShareTab from './ShareTab';

const Actions = ({ filters }) => {
  return (
    <WfPopover trigger={"click"} placement="bottom-end" color="white">
      <WfPopover.Trigger>
        <button className="dashboard-button" type="button" title="Save and share this search">
          <i className="fa fa-bookmark"></i>
          <span>Save / share</span>
        </button>
      </WfPopover.Trigger>
      <WfPopover.Container>
        <div className="text-sm text-gray-900 w-80">
          <ShareTab filters={filters} />
        </div>
      </WfPopover.Container>
    </WfPopover>
  );
};

export default Actions;
