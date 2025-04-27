/**
 * Formats Norwegian address components into a readable string
 * @param {Object} addr - Address object with components
 * @returns {String} Formatted address string
 */
export const formatNorwegianAddress = (addr) => {
  if (!addr) return '';
  
  const street = addr.road || addr.pedestrian || addr.street || '';
  const houseNumber = addr.house_number || '';
  const postcode = addr.postcode || '';
  const city = addr.city || addr.town || addr.village || '';
  
  const streetWithNumber = street && houseNumber ? `${street} ${houseNumber}` : street;
  const location = postcode && city ? `${postcode} ${city}` : city;
  
  return streetWithNumber && location ? `${streetWithNumber}, ${location}` : streetWithNumber || location;
};

/**
 * Checks if a point is inside a polygon
 * @param {Array} point - [lat, lng] coordinates
 * @param {Array} polygon - Array of [lat, lng] coordinates forming a polygon
 * @returns {Boolean} True if point is inside polygon
 */
export const isPointInPolygon = (point, polygon) => {
  const x = point[0], y = point[1];
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    const intersect = ((yi > y) !== (yj > y))
      && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};
