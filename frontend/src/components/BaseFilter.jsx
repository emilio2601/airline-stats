import React, { useState } from 'react';
import WfPopover from './wf_popover';

const BaseFilter = ({ component: Component, setFilters, filters, dark }) => {
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
          <div className={`text-coolgray-700 font-medium flex w-max rounded-full border border-dashed px-3 py-1 cursor-pointer hover:bg-coolgray-50 ${dark ? "border-gray-800" : "border-coolgray-300"}`}>
            <div>
              {breakdown  && <i className="fa fa-times-circle pr-1.5" onClick={(e) => handleFilterClear(e, closePopover)} />}
              {!breakdown && <i className="fa fa-plus-circle pr-1.5" />}
            </div>
            <div>
              <span>{config.name}</span>
              {breakdown && <span className="mx-1.5">|</span>}
              {breakdown && <span className="text-blue-400">{breakdown}</span>}
            </div>
          </div>
        </WfPopover.Trigger>
        <WfPopover.Container>
          <div className="flex flex-col text-sm space-y-4 text-gray-900">
            <Component {...{closePopover, setBreakdown, setConfig, setFilters, filters}} />
          </div>
        </WfPopover.Container>
      </>
    )}>
    </WfPopover>
  )
}

export default BaseFilter; 