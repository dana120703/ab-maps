import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import useAddressLookup from '../../hooks/useAddressLookup';
import LoadingIndicator from '../ui/LoadingIndicator';

/**
 * Component to handle map events like clicks and mouse movements
 */
const MapEvents = ({ onMapClick, onMapMove, isDrawingEnabled, finishDrawing }) => {
  const { lookupAddressAtPoint, isLoading, error } = useAddressLookup();

  useMapEvents({
    click: async (e) => {
      console.log('Map clicked at:', e.latlng);
      
      // If we're in drawing mode, we don't need to look up addresses
      if (isDrawingEnabled) {
        onMapClick(e.latlng, []);
        return;
      }
      
      try {
        const addresses = await lookupAddressAtPoint(e.latlng);
        onMapClick(e.latlng, addresses);
      } catch (err) {
        console.error('Error in map click handler:', err);
        onMapClick(e.latlng, []);
      }
    },
    mousemove: (e) => {
      onMapMove(e);
    }
  });

  // Add keyboard event listener for Enter key to finish drawing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && isDrawingEnabled) {
        console.log('Enter key pressed while drawing, finishing area');
        finishDrawing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawingEnabled, finishDrawing]);

  // Show loading indicator when loading addresses
  if (isLoading) {
    return <LoadingIndicator />;
  }

  // Show error if there is one
  if (error) {
    console.error('Address lookup error:', error);
  }

  return null;
};

export default MapEvents;
