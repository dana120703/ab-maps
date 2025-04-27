import React from 'react';

/**
 * Dialog for configuring area properties
 */
const AreaDialog = ({ 
  showDialog, 
  areaData, 
  onDataChange, 
  onConfirm, 
  onCancel 
}) => {
  if (!showDialog) return null;

  return (
    <div className="area-dialog-overlay">
      <div className="area-dialog">
        <h2>Tildel område</h2>
        <div className="area-form">
          <input
            type="text"
            placeholder="Tittel"
            value={areaData.title}
            onChange={(e) => onDataChange({ ...areaData, title: e.target.value })}
            className="area-input"
          />
          <input
            type="text"
            placeholder="🔍Søk etter team medlemmer..."
            value={areaData.teamMembers}
            onChange={(e) => onDataChange({ ...areaData, teamMembers: e.target.value })}
            className="area-input"
          />
          <input
            type="color"
            value={areaData.color}
            onChange={(e) => onDataChange({ ...areaData, color: e.target.value })}
            className="area-color-picker"
          />
          <div className="area-info">
            <p>Salgsmuligheter: {areaData.houseCount}</p>
          </div>
          <div className="area-buttons">
            <button className="cancel-button" onClick={onCancel}>
              Avbryt
            </button>
            <button className="confirm-button" onClick={onConfirm}>
              Bekreft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AreaDialog;
