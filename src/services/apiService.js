/**
 * API service for handling external data requests
 */

/**
 * Fetches addresses within a polygon using Overpass API
 * @param {Array} points - Array of {lat, lng} points forming a polygon
 * @returns {Array} Array of formatted address strings
 */
import { API_CONFIG } from '../config/apiConfig';
import { formatNorwegianAddress, isPointInPolygon } from '../utils/addressUtils';

export const getAddressesInPolygon = async (points) => {
  if (!points || points.length < 3) return [];

  const bounds = points.reduce((acc, point) => {
    return {
      minLat: Math.min(acc.minLat, point.lat),
      maxLat: Math.max(acc.maxLat, point.lat),
      minLng: Math.min(acc.minLng, point.lng),
      maxLng: Math.max(acc.maxLng, point.lng)
    };
  }, {
    minLat: points[0].lat,
    maxLat: points[0].lat,
    minLng: points[0].lng,
    maxLng: points[0].lng
  });

  try {
    // Use Overpass API to get all addresses in the bounding box
    const query = `
      [out:json][timeout:${API_CONFIG.overpass.timeout}];
      (
        way["addr:housenumber"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
        node["addr:housenumber"](${bounds.minLat},${bounds.minLng},${bounds.maxLat},${bounds.maxLng});
      );
      out body;
      >;
      out skel qt;
    `;

    const response = await fetch(API_CONFIG.overpass.baseUrl, {
      method: 'POST',
      body: query
    });

    const data = await response.json();
    const addresses = [];

    // Process nodes with address information
    const nodes = data.elements.filter(el => el.type === 'node' && el.tags && el.tags['addr:housenumber']);
    for (const node of nodes) {
      const { lat, lon } = node;
      const tags = node.tags;
      
      // Check if the point is inside the polygon
      if (isPointInPolygon([lat, lon], points.map(p => [p.lat, p.lng]))) {
        const address = formatAddressFromTags(tags);
        if (address) {
          addresses.push({
            address,
            position: { lat, lng: lon },
            tags
          });
        }
      }
    }

    // Process ways with address information
    const ways = data.elements.filter(el => el.type === 'way' && el.tags && el.tags['addr:housenumber']);
    const nodeMap = new Map(data.elements.filter(el => el.type === 'node').map(node => [node.id, node]));
    
    for (const way of ways) {
      if (way.nodes && way.nodes.length > 0) {
        // Calculate centroid of the way
        let sumLat = 0, sumLon = 0;
        let count = 0;
        
        for (const nodeId of way.nodes) {
          const node = nodeMap.get(nodeId);
          if (node) {
            sumLat += node.lat;
            sumLon += node.lon;
            count++;
          }
        }
        
        if (count > 0) {
          const lat = sumLat / count;
          const lon = sumLon / count;
          
          // Check if the centroid is inside the polygon
          if (isPointInPolygon([lat, lon], points.map(p => [p.lat, p.lng]))) {
            const address = formatAddressFromTags(way.tags);
            if (address) {
              addresses.push({
                address,
                position: { lat, lng: lon },
                tags: way.tags
              });
            }
          }
        }
      }
    }

    return addresses;
  } catch (error) {
    console.error('Error fetching addresses in polygon:', error);
    return [];
  }
};

/**
 * Format address from OSM tags
 * @param {Object} tags - OSM tags
 * @returns {string} - Formatted address
 */
function formatAddressFromTags(tags) {
  const street = tags['addr:street'] || '';
  const housenumber = tags['addr:housenumber'] || '';
  const postcode = tags['addr:postcode'] || '';
  const city = tags['addr:city'] || '';
  
  if (street && housenumber) {
    return `${street} ${housenumber}${postcode ? ', ' + postcode : ''}${city ? ' ' + city : ''}`;
  }
  return '';
}

/**
 * Search for an address using Nominatim API
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of search results
 */
export const searchAddress = async (query) => {
  if (!query || query.trim() === '') return [];

  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${API_CONFIG.nominatim.baseUrl}/search?format=json&q=${encodedQuery}&countrycodes=${API_CONFIG.nominatim.countryCode}&addressdetails=1&limit=${API_CONFIG.nominatim.limit}`;
    
    const response = await fetch(url, {
      headers: API_CONFIG.nominatim.headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return data.map(item => ({
      display_name: formatNorwegianAddress(item.address),
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      address: item.address
    }));
  } catch (error) {
    console.error('Error searching for address:', error);
    return [];
  }
};

/**
 * Reverse geocode a location using Nominatim API
 * @param {Object} latlng - { lat, lng } object
 * @returns {Promise<Object>} - Address data
 */
export const reverseGeocode = async (latlng) => {
  try {
    const url = `${API_CONFIG.nominatim.baseUrl}/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&zoom=${API_CONFIG.nominatim.zoom}&addressdetails=1&countrycodes=${API_CONFIG.nominatim.countryCode}`;
    
    const response = await fetch(url, {
      headers: API_CONFIG.nominatim.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
};

/**
 * Search for nearby addresses
 * @param {string} street - Street name
 * @param {string} city - City name
 * @param {string} postcode - Postal code
 * @returns {Promise<Array>} - Array of nearby addresses
 */
export const searchNearbyAddresses = async (street, city, postcode) => {
  try {
    const params = new URLSearchParams({
      format: 'json',
      street: street || '',
      city: city || '',
      postalcode: postcode || '',
      countrycodes: API_CONFIG.nominatim.countryCode,
      addressdetails: 1,
      limit: API_CONFIG.nominatim.limit
    });
    
    const url = `${API_CONFIG.nominatim.baseUrl}/search?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: API_CONFIG.nominatim.headers
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching for nearby addresses:', error);
    throw error;
  }
};
