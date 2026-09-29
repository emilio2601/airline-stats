import React from 'react';

const PagingButton = ({ children, ...props}) => {
  return <button {...props} className="dashboard-button" >
    {children}
  </button>
}

export default PagingButton;
