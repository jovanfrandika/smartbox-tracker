import type { Position } from '../../types';

export const filterNumber = (str: string) => str.replace(/[^0-9]/g, '');

// Converts numeric degrees to radians
const toRad = (value: number) => {
  return value * Math.PI / 180;
}

export const getCrowInMeters = (src: Position, centerDest: Position) => {
  const earthRadiusKm = 6371;
  const dLat = toRad(centerDest.lat - src.lat);
  const dLon = toRad(centerDest.lng - src.lng);
  const lat1 = toRad(src.lat);
  const lat2 = toRad(centerDest.lat);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = earthRadiusKm * c;
  return d;
}
