import React from 'react';

/**
 * Loading indicator component
 * @param {Object} props - Component props
 * @param {string} props.message - Optional message to display
 * @param {boolean} props.fullScreen - Whether to display full screen overlay
 * @returns {JSX.Element} - Loading indicator component
 */
const LoadingIndicator = ({ message = 'Henter adresser...', fullScreen = false }) => {
  const className = fullScreen ? 'loading-overlay' : 'loading-indicator';
  
  return (
    <div className={className}>
      <div className="spinner"></div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default LoadingIndicator;
