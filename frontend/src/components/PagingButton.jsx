import React from 'react';

const PagingButton = ({ children, ...props}) => {
  return <button {...props} className="border border-gray-300 hover:border-gray-100 disabled:border-gray-500 disabled:text-gray-500 disabled:cursor-not-allowed rounded-md py-2 px-4 uppercase tracking-wider text-gray-300 hover:text-gray-100 text-sm" >
    {children}
  </button>
}

export default PagingButton; 