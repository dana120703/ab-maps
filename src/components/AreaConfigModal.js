import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

const AreaConfigModal = ({ onConfirm, onCancel, addressCount }) => {
  const [areaName, setAreaName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2b2d42');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      name: areaName,
      color: selectedColor
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Configure Area</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="areaName">Area Name:</label>
            <input
              type="text"
              id="areaName"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="Enter area name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Area Color:</label>
            <div className="color-picker-container">
              <div
                className="color-preview"
                style={{ backgroundColor: selectedColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              {showColorPicker && (
                <div className="color-picker-popover">
                  <div className="color-picker-cover" onClick={() => setShowColorPicker(false)} />
                  <SketchPicker
                    color={selectedColor}
                    onChange={(color) => setSelectedColor(color.hex)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="address-count">
            Number of addresses in this area: <strong>{addressCount}</strong>
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              Confirm
            </button>
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaConfigModal;
