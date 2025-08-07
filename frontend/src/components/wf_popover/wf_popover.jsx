import React, { createContext, useContext, createRef, useEffect, useState, useRef  } from 'react'
import { createPopper } from '@popperjs/core'
import './wf_popover.css'

export const useOutsideAlterter = (initialValue) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(initialValue);
  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target) && event.isTrusted) {
      setVisible(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [ref]);
  return { visible, setVisible, ref };
};

export const parseTriggers = (trigger) => {
  if (typeof trigger === "string") {
    return [trigger];
  }
  return trigger;
};

export const getModifiers = (fallbackPlacements) => {
  const offset = {
    name: "offset",
    options: {
      offset: [0, 10],
    },
  }

  const fallbackPlacementsMod = {
    name: 'flip',
    options: {
      fallbackPlacements: fallbackPlacements
    }
  }

  const modifiers = [offset]
  
  if (fallbackPlacements.length > 0) {
    modifiers.push(fallbackPlacementsMod)
  }
  
  return modifiers
};


const PopoverContext = createContext()

const COLOR_SCHEMES = {
  white: {
    bg: 'bg-white',
    border: 'border-coolgray-100',
    header: '',
    divider: 'border-coolgray-400',
  },
  coolgray: {
    bg: 'bg-coolgray-100',
    border: 'border-coolgray-300',
    header: '',
    divider: 'border-coolgray-400',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    header: 'text-blue-800',
    divider: 'border-coolgray-400',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    header: 'text-green-900',
    divider: 'border-green-600 border-opacity-25',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    header: 'text-yellow-900',
    divider: 'border-yellow-600 border-opacity-25',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-300 border-opacity-25',
    header: 'text-red-800',
    divider: 'border-red-500 border-opacity-25',
  },
  arisapink: {
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    header: 'text-pink-500',
    divider: 'border-pink-600 border-opacity-25',
  },
  darkgray: {
    bg: 'bg-coolgray-900',
    border: 'border-coolgray-900',
    header: 'text-gray-100',
    divider: 'border-coolgray-600',
  },
  none: { bg: '', border: '', header: '', divier: '' },
}

const WfPopover = ({
  placement = 'auto',
  trigger = ['click'],
  color = 'coolgray',
  strategy = 'fixed',
  hideArrow = false,
  hideCloseButton = false,
  fallbackPlacements = [],
  zIndex = 9999,
  isDisabled = false,
  defaultVisible = false,
  triggerIsInline = true,
  customWidth,
  renderCallback,
  children,
}) => {
  const { visible, setVisible, ref } = useOutsideAlterter(false)
  const triggers = parseTriggers(trigger)
  const targetRef = createRef()
  const popoverRef = createRef(null)

  const colorScheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.none

  useEffect(() => {
    if (defaultVisible) {
      openPopover()
    }
  }, [])

  const openPopover = () => {
    createPopper(targetRef.current, popoverRef.current, {
      placement: placement,
      strategy: strategy,
      modifiers: getModifiers(fallbackPlacements),
    })
    setVisible(true)
  }

  const closePopover = () => {
    setVisible(false)
  }

  const handleClick = () => {
    if (!visible) {
      openPopover()
    } else {
      closePopover()
    }
    setVisible(!visible)
  }

  return (
    <PopoverContext.Provider
      value={{
        triggers,
        color,
        colorScheme,
        customWidth,
        openPopover,
        closePopover,
        handleClick,
        targetRef,
        popoverRef,
        visible,
        isDisabled,
        hideArrow,
        hideCloseButton,
        zIndex,
      }}
    >
      {/* Note: the margin and padding here makes it so that popover doesn't disappear when mouse goes from target to the popover content. Don't remove them :) */}
      <div
        className={`cursor-pointer min-w-max p-4 -m-4 ${
          triggerIsInline ? 'inline-block' : ''
        }`}
        ref={ref}
        onMouseLeave={triggers.includes('hover') ? closePopover : undefined}
      >
        {renderCallback ? renderCallback({ visible, closePopover }) : children}
      </div>
    </PopoverContext.Provider>
  )
}

const Trigger = ({ children }) => {
  const { isDisabled, triggers, openPopover, handleClick, targetRef } =
    useContext(PopoverContext)

  if (isDisabled) {
    return children
  }

  const onMouseEnter = triggers.includes('hover') ? openPopover : undefined

  const onClick = triggers.includes('click') ? handleClick : undefined

  return (
    <div
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      ref={targetRef}
      aria-haspopup="true"
      role="button"
    >
      {children}
    </div>
  )
}

const Container = ({ children }) => {
  const {
    color,
    customWidth,
    colorScheme,
    isDisabled,
    visible,
    popoverRef,
    zIndex,
    closePopover,
    hideArrow,
    hideCloseButton,
  } = useContext(PopoverContext)
  if (isDisabled) {
    return null
  }
  return (
    <div
      id="popover"
      className={`
      ${color !== 'none' && 'py-2 px-3 rounded-md border shadow-sm'} 
      ${customWidth ? customWidth : 'max-w-xs md:max-w-sm'}
      ${!visible && 'hidden'} 
      ${colorScheme.border} ${colorScheme.bg}`}
      ref={popoverRef}
      style={{ zIndex: zIndex }}
    >
      {!hideArrow && (
        <div
          id="popover-arrow"
          className={colorScheme.border}
          data-popper-arrow
        ></div>
      )}
      {!hideCloseButton && (
        <span
          onClick={() => closePopover()}
          className="fa fa-close float-right text-gray-400 hover:text-black"
        />
      )}
      {children}
    </div>
  )
}

const Header = ({ children }) => {
  const { colorScheme } = useContext(PopoverContext)
  return (
    <div
      className={`${colorScheme.header} ${colorScheme.bg} ${colorScheme.divider} border-b w-full py-2 px-4 font-medium text-sm`}
    >
      {children}
    </div>
  )
}

const Body = ({ children }) => {
  const { colorScheme } = useContext(PopoverContext)
  return (
    <div className={`${colorScheme.bg} w-full p-2 text-xs`}>{children}</div>
  )
}

WfPopover.Trigger = Trigger
WfPopover.Trigger.displayName = 'WfPopover.Trigger'
WfPopover.Container = Container
WfPopover.Container.displayName = 'WfPopover.Container'
WfPopover.Header = Header
WfPopover.Header.displayName = 'WfPopover.Header'
WfPopover.Body = Body
WfPopover.Body.displayName = 'WfPopover.Body'

export default WfPopover
