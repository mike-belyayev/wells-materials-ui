// Complete /src/utils/pobCalculations.ts
import { format } from 'date-fns';
import type { Trip, Site } from '../types';

export const getPassengerCount = (trip: Trip): number => {
  return trip.numberOfPassengers && trip.numberOfPassengers > 1 
    ? trip.numberOfPassengers 
    : 1;
};

export const calculatePOB = (
  date: Date, 
  currentLocation: string, 
  allTrips: Trip[], 
  sites: Site[]
): { pob: number; updateInfo?: string } => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  const site = sites.find(s => s.siteName === currentLocation);
  if (!site) return { pob: 0 };

  const siteLastUpdate = site.pobUpdatedDate ? new Date(site.pobUpdatedDate) : new Date();
  const siteLastUpdateStr = format(siteLastUpdate, 'yyyy-MM-dd');
  const sitePOBAtUpdate = site.currentPOB;

  if (dateStr === siteLastUpdateStr) {
    const todaysTrips = allTrips.filter(trip => 
      (trip.toDestination === currentLocation || trip.fromOrigin === currentLocation) &&
      trip.tripDate === dateStr
    );
    
    let todaysNetChange = 0;
    todaysTrips.forEach(trip => {
      const passengerCount = getPassengerCount(trip);
      if (trip.toDestination === currentLocation) {
        todaysNetChange += passengerCount;
      } else if (trip.fromOrigin === currentLocation) {
        todaysNetChange -= passengerCount;
      }
    });

    const endOfDayPOB = sitePOBAtUpdate + todaysNetChange;
    
    return { 
      pob: Math.max(0, endOfDayPOB),
      updateInfo: `updated to ${sitePOBAtUpdate}`
    };
  }

  if (dateStr < siteLastUpdateStr) {
    return calculatePOBBeforeUpdate(dateStr, siteLastUpdateStr, sitePOBAtUpdate, currentLocation, allTrips);
  }

  return calculatePOBAfterUpdate(dateStr, siteLastUpdateStr, sitePOBAtUpdate, currentLocation, allTrips);
};

// Calculate POB for dates before the last update (working backwards from update day START)
const calculatePOBBeforeUpdate = (
  targetDate: string,
  updateDate: string,
  pobAtUpdateStart: number,
  currentLocation: string,
  allTrips: Trip[]
): { pob: number; updateInfo?: string } => {
  const relevantTrips = allTrips
    .filter(trip => 
      (trip.toDestination === currentLocation || trip.fromOrigin === currentLocation) &&
      trip.tripDate >= targetDate &&
      trip.tripDate < updateDate
    )
    .sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime());

  let currentPOB = pobAtUpdateStart;

  const tripsByDate: { [date: string]: Trip[] } = {};
  relevantTrips.forEach(trip => {
    if (!tripsByDate[trip.tripDate]) {
      tripsByDate[trip.tripDate] = [];
    }
    tripsByDate[trip.tripDate].push(trip);
  });

  const sortedDates = Object.keys(tripsByDate).sort().reverse();
  
  for (const tripDate of sortedDates) {
    const daysTrips = tripsByDate[tripDate];
    
    let dailyNetChange = 0;
    daysTrips.forEach(trip => {
      const passengerCount = getPassengerCount(trip);
      
      if (trip.toDestination === currentLocation) {
        dailyNetChange -= passengerCount;
      } else if (trip.fromOrigin === currentLocation) {
        dailyNetChange += passengerCount;
      }
    });

    currentPOB += dailyNetChange;
  }

  return { pob: Math.max(0, currentPOB) };
};

// Calculate POB for dates after the last update (working forwards from update day END)
const calculatePOBAfterUpdate = (
  targetDate: string,
  updateDate: string,
  pobAtUpdateStart: number,
  currentLocation: string,
  allTrips: Trip[]
): { pob: number; updateInfo?: string } => {
  const relevantTrips = allTrips
    .filter(trip => 
      (trip.toDestination === currentLocation || trip.fromOrigin === currentLocation) &&
      trip.tripDate >= updateDate &&
      trip.tripDate <= targetDate
    )
    .sort((a, b) => new Date(a.tripDate).getTime() - new Date(b.tripDate).getTime());

  let currentPOB = pobAtUpdateStart;

  const tripsByDate: { [date: string]: Trip[] } = {};
  relevantTrips.forEach(trip => {
    if (!tripsByDate[trip.tripDate]) {
      tripsByDate[trip.tripDate] = [];
    }
    tripsByDate[trip.tripDate].push(trip);
  });

  const sortedDates = Object.keys(tripsByDate).sort();
  
  for (const tripDate of sortedDates) {
    const daysTrips = tripsByDate[tripDate];
    
    let dailyNetChange = 0;
    daysTrips.forEach(trip => {
      const passengerCount = getPassengerCount(trip);
      
      if (trip.toDestination === currentLocation) {
        dailyNetChange += passengerCount;
      } else if (trip.fromOrigin === currentLocation) {
        dailyNetChange -= passengerCount;
      }
    });

    currentPOB += dailyNetChange;
  }

  return { pob: Math.max(0, currentPOB) };
};