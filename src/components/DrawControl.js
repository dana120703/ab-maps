import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import AreaConfigModal from './AreaConfigModal';

const DrawControl = ({ onPolygonCreated, onPolygonEdited, onPolygonDeleted, isEnabled, getAddressesInPolygon }) => {
  const map = useMap();
  const drawControlRef = useRef(null);
  const drawnItemsRef = useRef(new L.FeatureGroup());
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempLayer, setTempLayer] = useState(null);
  const [addressCount, setAddressCount] = useState(0);

  useEffect(() => {
    // Add the FeatureGroup to the map
    map.addLayer(drawnItemsRef.current);

    // Initialize draw control if it hasn't been initialized
    if (!drawControlRef.current) {
      const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
          marker: false,
          circlemarker: false,
          circle: false,
          rectangle: false,
          polyline: false,
          polygon: {
            allowIntersection: false,
            showArea: true,
            drawError: {
              color: '#e1e100',
              message: '<strong>Polygon error:</strong> Edges cannot cross!'
            },
            shapeOptions: {
              color: '#2b2d42',
              fillOpacity: 0.2
            },
            metric: true
          }
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
          edit: {
            selectedPathOptions: {
              maintainColor: true,
              dashArray: '10, 10'
            }
          }
        }
      });

      drawControlRef.current = drawControl;
    }

    // Add or remove the control based on isEnabled
    if (isEnabled && !map.drawControl) {
      map.addControl(drawControlRef.current);
      map.drawControl = drawControlRef.current;
    } else if (!isEnabled && map.drawControl) {
      map.removeControl(map.drawControl);
      delete map.drawControl;
    }

    // Event handlers
    const handleCreated = async (e) => {
      const layer = e.layer;
      const coordinates = layer.getLatLngs()[0];
      
      // Count addresses in the polygon
      const addresses = await getAddressesInPolygon(coordinates);
      setAddressCount(addresses.length);
      
      // Store the layer temporarily
      setTempLayer(layer);
      
      // Show the configuration modal
      setShowConfigModal(true);
    };

    const handleEdited = (e) => {
      const layers = e.layers;
      layers.eachLayer((layer) => {
        const coordinates = layer.getLatLngs()[0].map(latLng => [latLng.lat, latLng.lng]);
        
        const geojson = {
          type: 'Feature',
          properties: {
            name: layer.name || '',
            color: layer.options.color || '#2b2d42'
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates.concat([coordinates[0]])]
          }
        };

        onPolygonEdited(geojson);
      });
    };

    const handleDeleted = (e) => {
      const deletedGeojsons = [];
      e.layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const coordinates = layer.getLatLngs()[0].map(latLng => [latLng.lat, latLng.lng]);
          const geojson = {
            type: 'Feature',
            properties: {
              name: layer.name || '',
              color: layer.options.color || '#2b2d42'
            },
            geometry: {
              type: 'Polygon',
              coordinates: [coordinates.concat([coordinates[0]])]
            }
          };
          deletedGeojsons.push(geojson);
        }
      });
      if (onPolygonDeleted && deletedGeojsons.length > 0) {
        onPolygonDeleted(deletedGeojsons);
      }
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.EDITED, handleEdited);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    // Cleanup
    return () => {
      if (map.drawControl) {
        map.removeControl(map.drawControl);
        delete map.drawControl;
      }
      map.removeLayer(drawnItemsRef.current);
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.EDITED, handleEdited);
      map.off(L.Draw.Event.DELETED, handleDeleted);
    };
  }, [map, onPolygonCreated, onPolygonEdited, onPolygonDeleted, isEnabled, getAddressesInPolygon]);

  const handleConfigConfirm = ({ name, color }) => {
    if (tempLayer) {
      // Update layer style
      tempLayer.setStyle({
        color: color,
        fillColor: color,
        fillOpacity: 0.2
      });

      // Add custom properties
      tempLayer.name = name;
      
      // Add to map
      drawnItemsRef.current.addLayer(tempLayer);

      // Create GeoJSON
      const coordinates = tempLayer.getLatLngs()[0].map(latLng => [latLng.lat, latLng.lng]);
      const geojson = {
        type: 'Feature',
        properties: {
          name: name,
          color: color
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates.concat([coordinates[0]])]
        }
      };

      onPolygonCreated(geojson);
    }

    // Reset temporary state
    setShowConfigModal(false);
    setTempLayer(null);
    setAddressCount(0);
  };

  const handleConfigCancel = () => {
    if (tempLayer) {
      // Remove the temporary layer
      map.removeLayer(tempLayer);
    }
    setShowConfigModal(false);
    setTempLayer(null);
    setAddressCount(0);
  };

  return (
    <>
      {showConfigModal && (
        <AreaConfigModal
          onConfirm={handleConfigConfirm}
          onCancel={handleConfigCancel}
          addressCount={addressCount}
        />
      )}
    </>
  );
};

export default DrawControl;
