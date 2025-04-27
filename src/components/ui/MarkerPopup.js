import React from 'react';
import { Popup } from 'react-leaflet';

/**
 * Component for displaying marker information
 */
const MarkerPopup = ({ marker }) => {
  return (
    <Popup>
      <div className="popup-content">
        <p>{marker.address}</p>
        <div className="status-tag">
          Status: {marker.status === 'Ja' ? 'Interessert' : 
                  marker.status === 'Ikke hjemme' ? 'Ikke hjemme' : 
                  'Ikke interessert'}
        </div>
      </div>
    </Popup>
  );
};

export default MarkerPopup;
