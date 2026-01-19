// src/hooks/useDragAndDrop.ts
import { useState, useCallback } from 'react';
import type { Trip, TripType } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { format } from 'date-fns';
import { getSortKey } from '../utils/sortUtils';

export const useDragAndDrop = (
  isAdmin: boolean,
  userToken: string | undefined,
  currentLocation: string,
  trips: Trip[],
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>,
  fetchData: () => Promise<void>
) => {
  const [draggedTrip, setDraggedTrip] = useState<{
    trip: Trip;
    type: TripType;
    sourceDate: string;
  } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = useCallback((trip: Trip, type: TripType) => {
    if (!isAdmin) return;
    setDraggedTrip({ trip, type, sourceDate: trip.tripDate });
    setIsDragging(true);
  }, [isAdmin]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!isAdmin || !draggedTrip) return;
    e.preventDefault();
    setDragOverIndex(index);
  }, [isAdmin, draggedTrip]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTrip(null);
    setDragOverIndex(null);
    setIsDragging(false);
  }, []);

  const handleDropReorder = useCallback(async (
    targetTrip: Trip, 
    type: TripType,
    targetIndex: number
  ) => {
    if (!isAdmin || !draggedTrip || draggedTrip.trip._id === targetTrip._id || !userToken) return;
    
    try {
      const dateStr = targetTrip.tripDate;
      
      const sameDateTrips = trips.filter(t => 
        t.tripDate === dateStr &&
        ((type === 'incoming' && t.toDestination === currentLocation) ||
         (type === 'outgoing' && t.fromOrigin === currentLocation))
      );
      
      const draggedIndex = sameDateTrips.findIndex(t => t._id === draggedTrip.trip._id);
      if (draggedIndex === -1) return;
      
      const reorderedTrips = [...sameDateTrips];
      const [movedTrip] = reorderedTrips.splice(draggedIndex, 1);
      
      const adjustedTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      reorderedTrips.splice(adjustedTargetIndex, 0, movedTrip);
      
      const updatePromises = reorderedTrips.map((trip, index) => {
        const sortKey = getSortKey(currentLocation, type);
        const newSortIndices = { ...trip.sortIndices, [sortKey]: index };
        
        return fetch(API_ENDPOINTS.TRIP_SORT(trip._id), {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ sortIndices: newSortIndices })
        });
      });
      
      await Promise.all(updatePromises);
      
      setTrips(prevTrips => 
        prevTrips.map(trip => {
          const updatedTrip = reorderedTrips.find(rt => rt._id === trip._id);
          if (updatedTrip) {
            const newIndex = reorderedTrips.findIndex(rt => rt._id === trip._id);
            const sortKey = getSortKey(currentLocation, type);
            return {
              ...trip,
              sortIndices: {
                ...trip.sortIndices,
                [sortKey]: newIndex
              }
            };
          }
          return trip;
        })
      );
      
      setDraggedTrip(null);
      setDragOverIndex(null);
      setIsDragging(false);
      
    } catch (error) {
      console.error('Error reordering trips:', error);
      fetchData();
    }
  }, [isAdmin, userToken, currentLocation, trips, setTrips, draggedTrip, fetchData]);

  const handleDropMoveDate = useCallback(async (date: Date, type: TripType) => {
    if (!isAdmin || !draggedTrip || draggedTrip.type !== type || !userToken) return;
    
    try {
      const newDateStr = format(date, 'yyyy-MM-dd');
      
      const updatedTrip = {
        ...draggedTrip.trip,
        tripDate: newDateStr,
        sortIndices: {
          ...draggedTrip.trip.sortIndices,
          [getSortKey(currentLocation, type)]: 0
        }
      };
      
      const response = await fetch(API_ENDPOINTS.TRIP_BY_ID(draggedTrip.trip._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(updatedTrip)
      });
      
      if (!response.ok) throw new Error('Failed to move trip');
      
      setTrips(prevTrips => 
        prevTrips.map(t => t._id === draggedTrip.trip._id ? updatedTrip : t)
      );
      
      setDraggedTrip(null);
      setIsDragging(false);
      
    } catch (error) {
      console.error('Error moving trip:', error);
    }
  }, [isAdmin, userToken, currentLocation, draggedTrip, setTrips]);

  return {
    draggedTrip,
    dragOverIndex,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDropReorder,
    handleDropMoveDate
  };
};