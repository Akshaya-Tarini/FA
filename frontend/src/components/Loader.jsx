import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="loader-container">
      <div className="loader-spinner" />
      <span>{message}</span>
    </div>
  );
};

export default Loader;
