// src/utils/sortUtils.ts
import type { Trip, Passenger, TripType } from '../types';

export const getSortKey = (location: string, type: TripType): string => {
  return `${location}-${type}`;
};

export const getSortIndex = (trip: Trip, location: string, type: TripType): number => {
  if (!trip.sortIndices) return 9999;
  const key = getSortKey(location, type);
  return trip.sortIndices[key] ?? 9999;
};

export const sortTrips = (
  trips: Trip[], 
  location: string, 
  type: TripType,
  getPassengerById: (id: string) => Passenger | undefined
): Trip[] => {
  return [...trips].sort((a, b) => {
    // First by sort index
    const aIndex = getSortIndex(a, location, type);
    const bIndex = getSortIndex(b, location, type);
    
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    
    // Then by confirmed status
    if (a.confirmed && !b.confirmed) return -1;
    if (!a.confirmed && b.confirmed) return 1;
    
    // Then by passenger name (fallback)
    const passengerA = getPassengerById(a.passengerId);
    const passengerB = getPassengerById(b.passengerId);
    const nameA = passengerA ? `${passengerA.lastName} ${passengerA.firstName}`.toLowerCase() : '';
    const nameB = passengerB ? `${passengerB.lastName} ${passengerB.firstName}`.toLowerCase() : '';
    
    return nameA.localeCompare(nameB);
  });
};