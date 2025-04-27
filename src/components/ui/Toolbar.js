import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons';

/**
 * Component for map toolbar with drawing controls
 */
const Toolbar = ({ isDrawingEnabled, onToggleDrawing }) => {
  return (
    <div className="toolbar">
      <button 
        className={`tool-button ${isDrawingEnabled ? 'active' : ''}`}
        onClick={(e) => {
          // Prevent default behavior and stop propagation
          e.preventDefault();
          e.stopPropagation();
          
          // Toggle drawing mode
          onToggleDrawing(e);
          
          // Prevent the event from bubbling to the map
          return false;
        }}
        title="Tegn område"
      >
        <FontAwesomeIcon icon={faDrawPolygon} />
      </button>
    </div>
  );
};

export default Toolbar;
