// src/types/index.ts
export interface Passenger {
  _id: string;
  firstName: string;
  lastName: string;
  jobRole: string;
}

export interface Trip {
  _id: string;
  passengerId: string;
  fromOrigin: string;
  toDestination: string;
  tripDate: string;
  confirmed: boolean;
  numberOfPassengers?: number;
  sortIndices?: {
    [key: string]: number;
  };
}

export interface Site {
  _id: string;
  siteName: string;
  currentPOB: number;
  maximumPOB: number;
  pobUpdatedDate: string;
}

export interface DayData {
  date: Date;
  incoming: Trip[];
  outgoing: Trip[];
  pob: number;
  updateInfo?: string;
}

export type TripType = 'incoming' | 'outgoing';