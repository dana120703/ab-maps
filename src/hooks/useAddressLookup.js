import { useState, useCallback } from 'react';
import { reverseGeocode, searchNearbyAddresses } from '../services/apiService';
import { formatNorwegianAddress } from '../utils/addressUtils';

/**
 * Custom hook for address lookup functionality
 * @returns {Object} - Address lookup methods and state
 */
const useAddressLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Lookup address at a specific point on the map
   * @param {Object} latlng - { lat, lng } object
   * @returns {Promise<Array>} - Array of formatted addresses
   */
  const lookupAddressAtPoint = useCallback(async (latlng) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add delay between requests to avoid rate limiting
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
      // First, get the exact clicked location
      const data = await reverseGeocode(latlng);
      
      if (!data.address) {
        throw new Error('No address data found');
      }

      // Get precise address components
      const street = data.address.road || data.address.pedestrian || data.address.street || '';
      const houseNumber = data.address.house_number || '';
      const postcode = data.address.postcode || '';
      const city = data.address.city || data.address.town || data.address.village || '';
      
      // Format the main address
      const mainAddress = formatNorwegianAddress(data.address);
      
      // If we have a precise address (with house number), use it directly
      if (street && houseNumber) {
        return [mainAddress];
      } else {
        // Wait a bit before making the second request to avoid rate limiting
        await delay(1000);
        
        // Search for nearby addresses
        const nearbyData = await searchNearbyAddresses(street, city, postcode);
        
        // Format and filter nearby addresses
        const nearbyAddresses = nearbyData
          .map(addr => formatNorwegianAddress(addr.address))
          .filter(addr => addr && addr.trim() !== '');
        
        return nearbyAddresses;
      }
    } catch (err) {
      setError(err.message);
      console.error('Error looking up address:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    lookupAddressAtPoint,
    isLoading,
    error,
    clearError: () => setError(null)
  };
};

export default useAddressLookup;
