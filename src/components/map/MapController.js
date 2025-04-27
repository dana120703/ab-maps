import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Component for accessing the map instance and providing it to parent components
 */
const MapController = ({ onMapReady }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};

export default MapController;
