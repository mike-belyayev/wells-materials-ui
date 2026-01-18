import './PassengerCard.css';
import { isPast, isToday } from 'date-fns';

interface PassengerCardProps {
  firstName: string;
  lastName: string;
  jobRole: string;
  fromOrigin: string;
  toDestination: string;
  type: 'incoming' | 'outgoing';
  confirmed: boolean;
  numberOfPassengers?: number;
  tripDate?: string; // NEW: Add tripDate to determine if it's past
}

export default function PassengerCard({ 
  firstName, 
  lastName, 
  jobRole, 
  fromOrigin, 
  toDestination,
  type,
  confirmed,
  numberOfPassengers,
  tripDate // NEW: Trip date to determine past status
}: PassengerCardProps) {
  const fullName = `${firstName} ${lastName}`;
  
  // Get the relevant location for display
  const displayLocation = type === 'incoming' ? fromOrigin : toDestination;
  
  // NEW: Determine if this trip is in the past
  const isPastTrip = tripDate ? isPast(new Date(tripDate)) && !isToday(new Date(tripDate)) : false;
  
  // Get site abbreviation
  const getSiteAbbreviation = (site: string): string => {
    const siteUpper = site.toUpperCase();
    switch (siteUpper) {
      case 'STC': return 'STC';
      case 'NTM': return 'NTM';
      case 'NBD': return 'NBD';
      case 'NSC': return 'NSC';
      case 'OGLE': return '';
      case 'NDT': return 'NDT';
      default: return site.length > 3 ? site.substring(0, 3).toUpperCase() : site.toUpperCase();
    }
  };

  const siteAbbreviation = getSiteAbbreviation(displayLocation);
  const shouldShowSiteText = siteAbbreviation !== ''; // Only show if not empty (not Ogle)
  
  // NEW: Determine if this is a group trip
  const isGroupTrip = numberOfPassengers && numberOfPassengers > 1;
  
  // Base classes
  const baseClasses = `passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`;
  
  // NEW: Add past trip class
  const pastClass = isPastTrip ? 'past-trip' : '';
  
  // NEW: Add group trip class
  const groupClass = isGroupTrip ? 'group-trip' : '';

  return (
    <div 
      className={`${baseClasses} ${pastClass} ${groupClass}`}
    >
      <div className="passenger-content">
        <div className="passenger-main-info">
          {numberOfPassengers && numberOfPassengers > 0 && (
            <span className="passenger-count">[{numberOfPassengers}]</span>
          )}
          <div className="passenger-text">
            <div className="passenger-name">
              {fullName}
            </div>
            {jobRole && (
              <div className="passenger-job">
                {jobRole}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* NEW: Site text on right edge - only show if not Ogle */}
      {shouldShowSiteText && (
        <div className="site-text" title={displayLocation}>
          {siteAbbreviation}
        </div>
      )}
    </div>
  );
}