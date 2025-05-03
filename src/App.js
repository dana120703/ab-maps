import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Components
import MapController from './components/map/MapController';
import MapEvents from './components/map/MapEvents';
import DrawControl from './components/DrawControl';
import Toolbar from './components/ui/Toolbar';
import SearchBar from './components/ui/SearchBar';
import AddressPopup from './components/ui/AddressPopup';
import MarkerPopup from './components/ui/MarkerPopup';
import AreaPopup from './components/ui/AreaPopup';
import AreaDialog from './components/ui/AreaDialog';
import LoadingIndicator from './components/ui/LoadingIndicator';

// Hooks
import useMapState from './hooks/useMapState';

// Services
import { getAddressesInPolygon, reverseGeocode } from './services/apiService';

// Utils
import { formatNorwegianAddress } from './utils/addressUtils';

// Styles
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    // State
    position,
    clickedInfo,
    markers,
    mapRef,
    searchQuery,
    searchResults,
    isSearching,
    isDrawingEnabled,
    areas,
    currentArea,
    showAreaDialog,
    previewLine,
    currentAreaData,
    statusOptions,
    
    // Setters
    setMapRef,
    setCurrentAreaData,
    
    // Handlers
    handleMapClick,
    handleMapMove,
    handleStatusSelect,
    getMarkerIcon,
    handleSearchSelect,
    handleSearchChange,
    toggleDrawing,
    handlePolygonCreated,
    handlePolygonEdited,
    handleAreaEdit,
    handleAreaDelete,
    handleAreaConfirm,
    handleAreaCancel,
    handlePolygonDeleted,
    finishDrawing
  } = useMapState();

  // Prevent map click events when the toolbar is clicked
  useEffect(() => {
    const preventMapClick = (e) => {
      e.stopPropagation();
    };
    
    const toolbar = document.querySelector('.toolbar');
    if (toolbar) {
      toolbar.addEventListener('click', preventMapClick, true);
      toolbar.addEventListener('mousedown', preventMapClick, true);
      toolbar.addEventListener('mouseup', preventMapClick, true);
    }
    
    return () => {
      if (toolbar) {
        toolbar.removeEventListener('click', preventMapClick, true);
        toolbar.removeEventListener('mousedown', preventMapClick, true);
        toolbar.removeEventListener('mouseup', preventMapClick, true);
      }
    };
  }, []);

  return (
    <div className="app-container">
      {isLoading && <LoadingIndicator fullScreen={true} />}
      
      <MapContainer
        center={position}
        zoom={13}
        maxZoom={18}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        style={{ height: '100vh', width: '100%' }}
        ref={setMapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={18}
          maxNativeZoom={18}
          tileSize={256}
          zoomOffset={0}
          updateWhenZooming={false}
          updateWhenIdle={true}
        />
        
        <Toolbar 
          isDrawingEnabled={isDrawingEnabled} 
          onToggleDrawing={toggleDrawing} 
        />
        
        <DrawControl
          isEnabled={isDrawingEnabled}
          onPolygonCreated={handlePolygonCreated}
          onPolygonEdited={handlePolygonEdited}
          onPolygonDeleted={handlePolygonDeleted}
          getAddressesInPolygon={getAddressesInPolygon}
        />
        
        <MapController onMapReady={setMapRef} />
        <MapEvents 
          onMapClick={handleMapClick} 
          onMapMove={handleMapMove} 
          isDrawingEnabled={isDrawingEnabled}
          finishDrawing={finishDrawing}
        />
        
        {/* Display preview line while drawing */}
        {previewLine && (
          <Polyline
            positions={[previewLine.start, previewLine.end]}
            pathOptions={{ 
              color: '#f1c40f', 
              dashArray: '10, 10',
              weight: 3,
              opacity: 0.9
            }}
          />
        )}

        {/* Display current area being drawn */}
        {currentArea.length > 0 && (
          <Polygon 
            positions={currentArea} 
            pathOptions={{ color: currentAreaData.color, fillColor: currentAreaData.color, fillOpacity: 0.2 }} 
          />
        )}

        {/* Display saved areas */}
        {areas.map((area, index) => (
          <Polygon 
            key={index}
            positions={area.points}
            pathOptions={{ 
              color: area.properties.color, 
              fillColor: area.properties.color, 
              fillOpacity: 0.3 
            }}
            eventHandlers={{
              click: async (e) => {
                e.originalEvent.stopPropagation();
                try {
                  // Get addresses for this location using the same API service
                  const data = await reverseGeocode(e.latlng);
                  if (data.address) {
                    const formattedAddress = formatNorwegianAddress(data.address);
                    handleMapClick(e.latlng, [formattedAddress]);
                  }
                } catch (err) {
                  console.error('Error looking up address in polygon:', err);
                  handleMapClick(e.latlng, []);
                }
              }
            }}
          >
            <AreaPopup 
              area={area} 
              index={index} 
              onEdit={handleAreaEdit} 
              onDelete={handleAreaDelete} 
            />
          </Polygon>
        ))}
        
        {/* Display markers for status selections */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={getMarkerIcon(marker.status)}
          >
            <MarkerPopup marker={marker} />
          </Marker>
        ))}
        
        {/* Display address popup when clicking on map */}
        {clickedInfo && (
          <AddressPopup 
            position={clickedInfo.position}
            addresses={clickedInfo.addresses}
            statusOptions={statusOptions}
            onStatusSelect={handleStatusSelect}
          />
        )}
      </MapContainer>
      
      {/* Search bar */}
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchResults={searchResults}
        isSearching={isSearching}
        onSearchSelect={handleSearchSelect}
      />

      {/* Area configuration dialog */}
      <AreaDialog 
        showDialog={showAreaDialog}
        areaData={currentAreaData}
        onDataChange={setCurrentAreaData}
        onConfirm={handleAreaConfirm}
        onCancel={handleAreaCancel}
      />
    </div>
  );
}

export default App;