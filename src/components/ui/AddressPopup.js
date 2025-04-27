import React from 'react';
import { Popup } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Component for displaying address information and status selection buttons
 */
const AddressPopup = ({ position, addresses, statusOptions, onStatusSelect }) => {
  if (!position || !addresses || addresses.length === 0) return null;

  return (
    <Popup position={position}>
      <div className="address-popup">
        <div className="address-list">
          {addresses.map((address, index) => (
            <div key={index} className="address-item">
              <p>{address}</p>
              <div className="status-buttons">
                {statusOptions.map((option, i) => (
                  <button
                    key={i}
                    className="status-button"
                    style={{ backgroundColor: option.color }}
                    onClick={() => onStatusSelect(address, option.label)}
                    title={option.label}
                  >
                    <FontAwesomeIcon icon={option.icon} />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Popup>
  );
};

export default AddressPopup;
