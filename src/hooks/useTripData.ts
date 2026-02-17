// src/hooks/useTripData.ts
import { useState, useCallback, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import type { Trip, Passenger, Site } from '../types';

export const useTripData = (userToken?: string) => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const headers = {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      };
      
      const [passengersRes, tripsRes, sitesRes] = await Promise.all([
        fetch(API_ENDPOINTS.PASSENGERS, { headers }),
        fetch(API_ENDPOINTS.TRIPS, { headers }),
        fetch(API_ENDPOINTS.SITES, { headers })
      ]);
      
      if (!passengersRes.ok) throw new Error('Failed to fetch passengers');
      if (!tripsRes.ok) throw new Error('Failed to fetch trips');
      if (!sitesRes.ok) throw new Error('Failed to fetch sites');
      
      const passengersData = await passengersRes.json();
      const tripsData = await tripsRes.json();
      const sitesData = await sitesRes.json();
      
      setPassengers(passengersData);
      setTrips(tripsData);
      setSites(sitesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userToken]);

  // Auto-refresh
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    let isMounted = true;
    
    const startPolling = async () => {
      try {
        await fetchData();
        
        if (isMounted) {
          refreshInterval = setInterval(async () => {
            try {
              await fetchData();
            } catch (error) {
              console.error('Error during auto-refresh:', error);
            }
          }, 600000); // 10 minutes
        }
      } catch (error) {
        console.error('Initial data fetch failed:', error);
      }
    };
    
    startPolling();
    
    return () => {
      isMounted = false;
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [fetchData]);

  return {
    passengers,
    trips,
    sites,
    loading,
    error,
    fetchData,
    setTrips,
    setPassengers
  };
};