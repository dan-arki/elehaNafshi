/**
 * Utility functions for location-related operations
 */

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers (rounded to 1 decimal place)
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Format distance for display
 * @param distance - Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance?: number): string => {
  if (!distance) return '';
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
};

/**
 * Generate a static map URL using Mapbox
 * @param latitude - Latitude of the location
 * @param longitude - Longitude of the location
 * @returns Mapbox static image URL
 */
export const generateMapUrl = (latitude: number, longitude: number): string => {
  const accessToken = 'pk.eyJ1IjoiZGFjaG91dnZ2IiwiYSI6ImNtNnRrZW1scDAzZ2gyaXNjb2F3eW45NzIifQ.C3R6xXHdTXtYBMEIS4ICBA';
  const style = 'mapbox/streets-v11';
  const zoom = 15;
  const width = 400;
  const height = 200;
  const retina = '@2x';
  
  return `https://api.mapbox.com/styles/v1/${style}/static/pin-s-marker+ff0000(${longitude},${latitude})/${longitude},${latitude},${zoom}/${width}x${height}${retina}?access_token=${accessToken}`;
};