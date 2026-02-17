// src/components/HeliPage/WeekView.tsx
import React from 'react';
import { format, isPast, isToday } from 'date-fns';
import PassengerCard from './PassengerCard';
import type { DayData, Trip, Site, TripType, Passenger } from '../../types';

interface WeekViewProps {
  week: DayData[];
  currentLocation: string;
  sites: Site[];
  isAdmin: boolean;
  getPassengerById: (id: string) => Passenger | undefined;
  onAddTrip: (date: Date, type: TripType) => void;
  onEditTrip: (trip: Trip) => void;
  onDragStart: (trip: Trip, type: TripType) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDropReorder: (trip: Trip, type: TripType, index: number) => void;
  onDropMoveDate: (date: Date, type: TripType) => void;
  dragOverIndex: number | null;
  draggedTripId?: string;
}

const WeekView: React.FC<WeekViewProps> = ({
  week,
  currentLocation,
  sites,
  isAdmin,
  getPassengerById,
  onAddTrip,
  onEditTrip,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDropReorder,
  onDropMoveDate,
  dragOverIndex,
  draggedTripId
}) => {
  const getPOBStatus = (currentPOB: number, maximumPOB: number): 'normal' | 'warning' | 'critical' => {
    if (currentPOB === 0) return 'normal';
    const percentage = (currentPOB / maximumPOB) * 100;
    if (currentPOB > maximumPOB) return 'critical';
    if (percentage >= 95) return 'warning';
    return 'normal';
  };

  const site = sites.find(s => s.siteName === currentLocation);
  const maximumPOB = site?.maximumPOB || 200;

  return (
    <div className="week-row">
      {week.map((day, dayIndex) => {
        const isTodayDate = isToday(day.date);
        const isPastDay = isPast(day.date) && !isTodayDate;
        const pobStatus = getPOBStatus(day.pob, maximumPOB);

        return (
          <div key={dayIndex} className={`day-column ${isPastDay ? 'past-day' : ''}`}>
            <div className={`date-header ${isTodayDate ? 'today' : ''}`}>
              {format(day.date, 'MMM d')}
            </div>
            
            <div className="passenger-lists">
              <div className="sections-container">
                {/* Incoming Section */}
                <div 
                  className="incoming-section"
                  onDragOver={(e) => isAdmin && e.preventDefault()}
                  onDrop={(e) => {
                    if (!isAdmin) return;
                    e.preventDefault();
                    onDropMoveDate(day.date, 'incoming');
                  }}
                >
                  <div className="passenger-cards-container">
                    {day.incoming.map((trip, index) => (
                      <div
                        key={`${trip._id}-${index}`}
                        className={`passenger-card-container ${
                          !isAdmin ? 'readonly' : ''
                        } ${dragOverIndex === index ? 'drag-over' : ''} ${
                          draggedTripId === trip._id ? 'dragging' : ''
                        }`}
                        draggable={isAdmin && !isPastDay}
                        onDragStart={() => isAdmin && !isPastDay && onDragStart(trip, 'incoming')}
                        onDragOver={(e) => isAdmin && !isPastDay && onDragOver(e, index)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => {
                          if (!isAdmin || isPastDay) return;
                          e.preventDefault();
                          onDropReorder(trip, 'incoming', index);
                        }}
                        onClick={() => isAdmin && !isPastDay && onEditTrip(trip)}
                      >
                        <PassengerCard
                          firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                          lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                          jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                          fromOrigin={trip.fromOrigin}
                          toDestination={trip.toDestination}
                          type="incoming"
                          confirmed={trip.confirmed}
                          numberOfPassengers={trip.numberOfPassengers}
                          tripDate={trip.tripDate}
                        />
                      </div>
                    ))}
                  </div>
                  {isAdmin && !isPastDay && (
                    <button
                      onClick={() => onAddTrip(day.date, 'incoming')}
                      className="add-button"
                      title="Add incoming passenger"
                    >
                      +
                    </button>
                  )}
                </div>
                
                {/* Outgoing Section */}
                <div 
                  className="outgoing-section"
                  onDragOver={(e) => isAdmin && e.preventDefault()}
                  onDrop={(e) => {
                    if (!isAdmin) return;
                    e.preventDefault();
                    onDropMoveDate(day.date, 'outgoing');
                  }}
                >
                  <div className="passenger-cards-container">
                    {day.outgoing.map((trip, index) => (
                      <div
                        key={`${trip._id}-${index}`}
                        className={`passenger-card-container ${
                          !isAdmin ? 'readonly' : ''
                        } ${dragOverIndex === index ? 'drag-over' : ''} ${
                          draggedTripId === trip._id ? 'dragging' : ''
                        }`}
                        draggable={isAdmin && !isPastDay}
                        onDragStart={() => isAdmin && !isPastDay && onDragStart(trip, 'outgoing')}
                        onDragOver={(e) => isAdmin && !isPastDay && onDragOver(e, index)}
                        onDragLeave={onDragLeave}
                        onDrop={(e) => {
                          if (!isAdmin || isPastDay) return;
                          e.preventDefault();
                          onDropReorder(trip, 'outgoing', index);
                        }}
                        onClick={() => isAdmin && !isPastDay && onEditTrip(trip)}
                      >
                        <PassengerCard
                          firstName={getPassengerById(trip.passengerId)?.firstName || ''}
                          lastName={getPassengerById(trip.passengerId)?.lastName || ''}
                          jobRole={getPassengerById(trip.passengerId)?.jobRole || ''}
                          fromOrigin={trip.fromOrigin}
                          toDestination={trip.toDestination}
                          type="outgoing"
                          confirmed={trip.confirmed}
                          numberOfPassengers={trip.numberOfPassengers}
                          tripDate={trip.tripDate}
                        />
                      </div>
                    ))}
                  </div>
                  {isAdmin && !isPastDay && (
                    <button
                      onClick={() => onAddTrip(day.date, 'outgoing')}
                      className="add-button"
                      title="Add outgoing passenger"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`pob-footer ${pobStatus} ${isPastDay ? 'past' : ''}`}>
              POB: {day.pob}
              {day.updateInfo && (
                <span className="pob-update-info">
                  ({day.updateInfo})
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;