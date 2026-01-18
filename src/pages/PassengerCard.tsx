import './PassengerCard.css';

interface PassengerCardProps {
  firstName: string;
  lastName: string;
  jobRole: string;
  fromOrigin: string;
  toDestination: string;
  type: 'incoming' | 'outgoing';
  confirmed: boolean;
  numberOfPassengers?: number;
  colorIntensity?: 'normal' | 'dark';
  showSiteText?: boolean;
  isPast?: boolean;
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
  colorIntensity = 'normal',
  showSiteText = false,
  isPast = false
}: PassengerCardProps) {
  const fullName = `${firstName} ${lastName}`;
  
  // Get the relevant location for color coding
  const location = type === 'incoming' ? fromOrigin : toDestination;
  
  // Site color mapping
  const getSiteColor = (site: string): string => {
    const siteUpper = site.toUpperCase();
    switch (siteUpper) {
      case 'STC': return '#000000'; // black
      case 'NTM': return '#2e7d32'; // green
      case 'NBD': return '#1565c0'; // blue
      case 'NSC': return '#ff8f00'; // dark yellow
      case 'OGLE': return '#9575cd'; // calm light purple
      case 'NDT': return '#ffffff'; // white
      default: return '#666666'; // default gray
    }
  };

  const siteColor = getSiteColor(location);
  
  // Get the site abbreviation for display
  const getSiteAbbreviation = (site: string): string => {
    const siteUpper = site.toUpperCase();
    switch (siteUpper) {
      case 'STC': return 'STC';
      case 'NTM': return 'NTM';
      case 'NBD': return 'NBD';
      case 'NSC': return 'NSC';
      case 'OGLE': return 'OGL';
      case 'NDT': return 'NDT';
      default: return site.length > 3 ? site.substring(0, 3).toUpperCase() : site.toUpperCase();
    }
  };

  const siteAbbreviation = getSiteAbbreviation(location);
  
  // Determine if this is a group trip
  const isGroupTrip = numberOfPassengers && numberOfPassengers > 1;
  
  // Base classes
  const baseClasses = `passenger-card ${type} ${confirmed ? 'confirmed' : 'unconfirmed'}`;
  
  // Add color intensity class
  const colorClass = colorIntensity === 'dark' ? 'dark-intensity' : 'normal-intensity';
  
  // Add group trip class
  const groupClass = isGroupTrip ? 'group-trip' : '';
  
  // Add past day class
  const pastClass = isPast ? 'past-day' : '';

  return (
    <div 
      className={`${baseClasses} ${colorClass} ${groupClass} ${pastClass}`}
      style={{ 
        borderLeftColor: siteColor,
        // Override border for group trips
        ...(isGroupTrip && type === 'incoming' ? { borderLeftColor: '#0d47a1' } : {}),
        ...(isGroupTrip && type === 'outgoing' ? { borderLeftColor: '#1b5e20' } : {})
      }}
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
      
      {/* NEW: Site text on right edge */}
      {showSiteText && (
        <div className="site-text" title={location}>
          {siteAbbreviation}
        </div>
      )}
    </div>
  );
}