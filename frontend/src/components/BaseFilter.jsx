import React, { useState } from 'react';
import WfPopover from './wf_popover';

const BaseFilter = ({ component: Component, setFilters, filters, componentProps = {} }) => {
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
          <div className={`dashboard-filter-trigger${breakdown ? ' is-active' : ''}`}>
            {breakdown && <i className="fa fa-times-circle filter-remove" onClick={(e) => handleFilterClear(e, closePopover)} aria-label={`Clear ${config.name} filter`} />}
            <span>{config.name}</span>
            {breakdown && <span className="filter-value">{breakdown}</span>}
          </div>
        </WfPopover.Trigger>
        <WfPopover.Container>
          <div className="flex flex-col text-sm space-y-4 text-gray-900">
            <Component {...componentProps} {...{closePopover, setBreakdown, setConfig, setFilters, filters}} />
          </div>
        </WfPopover.Container>
      </>
    )}>
    </WfPopover>
  )
}

export default BaseFilter;
