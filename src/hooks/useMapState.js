import { useState, useRef, useCallback } from 'react';
import L from 'leaflet';
import { faPlus, faEye, faBan, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getAddressesInPolygon, searchAddress } from '../services/apiService';
import { isPointInPolygon } from '../utils/addressUtils';

/**
 * Custom hook for managing map state and interactions
 */
const useMapState = () => {
  // Map state
  const [position] = useState([59.9139, 10.7522]); // Oslo center
  const [clickedInfo, setClickedInfo] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapRef, setMapRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [justToggledDrawing, setJustToggledDrawing] = useState(false);
  const [areas, setAreas] = useState([]);
  const [currentArea, setCurrentArea] = useState([]);
  const [showAreaDialog, setShowAreaDialog] = useState(false);
  const [editingAreaIndex, setEditingAreaIndex] = useState(null);
  const [previewLine, setPreviewLine] = useState(null);
  const [currentAreaData, setCurrentAreaData] = useState({
    title: '',
    color: '#2b2d42',
    teamMembers: '',
    houseCount: 0
  });
  const searchTimeoutRef = useRef(null);

  // Status options for address markers
  const statusOptions = [
    { label: 'Ja', color: '#2ecc71', icon: faPlus },
    { label: 'Ikke hjemme', color: '#f1c40f', icon: faEye },
    { label: 'Nei', color: '#e74c3c', icon: faBan },
  ];

  // Handler for map clicks
  const handleMapClick = (latlng, addresses) => {
    // Completely ignore map clicks when the drawing button was just clicked
    if (justToggledDrawing) {
      setJustToggledDrawing(false);
      return;
    }
    
    // Process map clicks for drawing mode
    if (isDrawingEnabled) {
      setCurrentArea(prev => [...prev, latlng]);
      setPreviewLine(null);
    } else {
      // Only set clicked info if we're not in drawing mode
      setClickedInfo({
        position: latlng,
        addresses: addresses
      });
    }
  };

  // Handler for map mouse movement
  const handleMapMove = useCallback((e) => {
    if (isDrawingEnabled && currentArea.length > 0) {
      const lastPoint = currentArea[currentArea.length - 1];
      setPreviewLine({
        start: [lastPoint.lat, lastPoint.lng],
        end: [e.latlng.lat, e.latlng.lng]
      });
    }
  }, [isDrawingEnabled, currentArea]);

  // Finish drawing an area
  const finishDrawing = async () => {
    if (currentArea.length >= 3) {
      // Get accurate count of addresses within the polygon using the same method as handleAreaConfirm
      const addresses = await getAddressesInPolygon(currentArea);
      const addressCount = addresses.length;
      
      setCurrentAreaData(prev => ({
        ...prev,
        houseCount: addressCount
      }));
      setShowAreaDialog(true);
    }
  };

  // Handle status selection for an address
  const handleStatusSelect = (address, status) => {
    const newMarker = {
      position: clickedInfo.position,
      address: address,
      status: status
    };

    setMarkers(prev => {
      // Remove any existing marker for this address
      const filtered = prev.filter(m => m.address !== address);
      return [...filtered, newMarker];
    });

    // Update sales opportunities count for any areas containing this point
    const point = [clickedInfo.position.lat, clickedInfo.position.lng];
    setAreas(prev => prev.map(area => {
      if (isPointInPolygon(point, area.points.map(p => [p.lat, p.lng]))) {
        return {
          ...area,
          properties: {
            ...area.properties,
            houseCount: area.properties.houseCount + 1
          }
        };
      }
      return area;
    }));

    setClickedInfo(null);
  };

  // Get marker icon based on status
  const getMarkerIcon = (status) => {
    let color = '#3498db';
    let icon = faCheck;

    switch (status) {
      case 'Ja':
        color = '#2ecc71';
        icon = faPlus;
        break;
      case 'Ikke hjemme':
        color = '#f1c40f';
        icon = faEye;
        break;
      case 'Nei':
        color = '#e74c3c';
        icon = faBan;
        break;
    }

    return L.divIcon({
      className: 'icon-style-map',
      html: `<div style="background-color: ${color}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white;">
              <i class="fas fa-${icon.iconName}"></i>
            </div>`,
      iconSize: [24, 24]
    });
  };

  // Handle search selection
  const handleSearchSelect = (result) => {
    // Set the clicked info for the address
    setClickedInfo({
      position: { lat: parseFloat(result.lat), lng: parseFloat(result.lon) },
      addresses: [result.display_name]
    });
    
    // Update search state
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setIsSearching(false);
    
    // Smoothly fly to the selected location with animation
    if (mapRef) {
      mapRef.flyTo(
        [parseFloat(result.lat), parseFloat(result.lon)],
        17, // Reduced zoom level for better performance
        {
          animate: true,
          duration: 1.2, // Slightly faster animation
          easeLinearity: 0.25
        }
      );
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchAddress(value);
      setSearchResults(results);
    }, 500);
  };

  // Toggle drawing mode
  const toggleDrawing = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Always clear clicked info when toggling drawing mode
    setClickedInfo(null);
    setIsDrawingEnabled(!isDrawingEnabled);
    setJustToggledDrawing(true);
  };

  // Handle polygon creation from DrawControl
  const handlePolygonCreated = (polygon) => {
    setAreas(prevAreas => [...prevAreas, polygon]);
    setIsDrawingEnabled(false); // Disable drawing mode after creating a polygon
  };

  // Handle polygon editing from DrawControl
  const handlePolygonEdited = (editedPolygon) => {
    setAreas(prevAreas => prevAreas.map(area => 
      area.properties.name === editedPolygon.properties.name ? editedPolygon : area
    ));
  };

  // Handle area editing
  const handleAreaEdit = (index) => {
    const area = areas[index];
    setCurrentArea(area.points);
    setCurrentAreaData(area.properties);
    setEditingAreaIndex(index);
    setShowAreaDialog(true);
  };

  // Handle area deletion
  const handleAreaDelete = (index) => {
    setAreas(prevAreas => prevAreas.filter((_, i) => i !== index));
  };

  // Handle area confirmation
  const handleAreaConfirm = async () => {
    if (currentArea.length < 3) {
      alert('Tegn minst 3 punkter for å lage et område.');
      return;
    }

    // Get all addresses within the polygon
    const addresses = await getAddressesInPolygon(currentArea);
    const totalAddresses = addresses.length;

    if (editingAreaIndex !== null) {
      // Update existing area
      setAreas(prev => prev.map((area, index) => {
        if (index === editingAreaIndex) {
          return {
            points: currentArea,
            properties: {
              ...currentAreaData,
              houseCount: totalAddresses
            }
          };
        }
        return area;
      }));
    } else {
      // Create new area
      setAreas(prev => [...prev, {
        points: currentArea,
        properties: {
          ...currentAreaData,
          houseCount: totalAddresses
        }
      }]);
    }

    // Reset state
    setCurrentArea([]);
    setCurrentAreaData({
      title: '',
      color: '#2b2d42',
      teamMembers: '',
      houseCount: 0
    });
    setShowAreaDialog(false);
    setEditingAreaIndex(null);
    setIsDrawingEnabled(false);
  };

  // Handle area cancellation
  const handleAreaCancel = () => {
    setCurrentArea([]);
    setShowAreaDialog(false);
    setIsDrawingEnabled(false);
    setCurrentAreaData({
      title: '',
      color: '#2b2d42',
      teamMembers: '',
      houseCount: 0
    });
    setEditingAreaIndex(null);
  };

  // Handle polygon deletion from DrawControl
  const handlePolygonDeleted = (deletedPolygons) => {
    setAreas(prevAreas => prevAreas.filter(area => {
      // Compare each area to see if it matches any deleted polygon
      return !deletedPolygons.some(deleted => {
        // Compare coordinates (simple deep comparison)
        const areaCoords = area.geometry ? area.geometry.coordinates : area.points?.map(p => [p.lat, p.lng]);
        const deletedCoords = deleted.geometry?.coordinates;
        if (!areaCoords || !deletedCoords) return false;
        // Compare as JSON string for simplicity
        return JSON.stringify(areaCoords) === JSON.stringify(deletedCoords);
      });
    }));
  };

  return {
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
    editingAreaIndex,
    previewLine,
    currentAreaData,
    statusOptions,
    
    // Setters
    setMapRef,
    setCurrentAreaData,
    
    // Handlers
    handleMapClick,
    handleMapMove,
    finishDrawing,
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
    handlePolygonDeleted
  };
};

export default useMapState;
