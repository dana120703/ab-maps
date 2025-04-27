import React from 'react';
import { Popup } from 'react-leaflet';

/**
 * Component for displaying area information and action buttons
 */
const AreaPopup = ({ area, index, onEdit, onDelete }) => {
  return (
    <Popup>
      <div className="area-popup">
        <h3 style={{ color: area.properties.color }}>{area.properties.title}</h3>
        <p style={{ color: 'white' }}>Team: {area.properties.teamMembers}</p>
        <p style={{ color: 'white' }}>Salgsmuligheter: {area.properties.houseCount}</p>
        <button 
          className="edit-button" 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(index);
          }}
        >
          Rediger
        </button>
        <button
          className="delete-button"
          style={{ 
            marginLeft: '10px', 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            borderRadius: '5px', 
            border: 'none', 
            padding: '6px 12px', 
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1000 
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault(); 
            onDelete(index);
          }}
        >
          Slett
        </button>
      </div>
    </Popup>
  );
};

export default AreaPopup;
