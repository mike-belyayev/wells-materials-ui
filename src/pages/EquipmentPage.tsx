// src/pages/EquipmentPage.tsx
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, MenuItem, Select, TextField, Popover } from '@mui/material';
import { Settings, Add, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import LocationDropdown from '../components/HeliPage/LocationDropdown';
import WellColumn from '../components/EquipmentPage/WellColumn';
import CreateWellModal from '../components/EquipmentPage/CreateWellModal';
import AddPhaseModal from '../components/EquipmentPage/AddPhaseModal';
import AddItemModal from '../components/EquipmentPage/AddItemModal';
import { API_ENDPOINTS } from '../config/api';
import type { Well, Site } from '../types';
import './EquipmentPage.css';

const EquipmentPage = () => {
  const { logout, user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const navigate = useNavigate();

  // State
  const [currentLocation, setCurrentLocation] = useState(user?.homeLocation || 'NSC');
  const [setSites] = useState<Site[]>([]);
  const [allWells, setAllWells] = useState<Well[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Wells filtered by current location (owner)
  const [locationWells, setLocationWells] = useState<Well[]>([]);
  
  // Active/Next well states
  const [activeWell, setActiveWell] = useState<Well | null>(null);
  const [nextWell, setNextWell] = useState<Well | null>(null);
  
  // Column count states (1-4)
  const [activeWellColumns, setActiveWellColumns] = useState(2);
  const [nextWellColumns, setNextWellColumns] = useState(2);
  
  // Modal states
  const [createWellModalOpen, setCreateWellModalOpen] = useState(false);
  const [addPhaseModalOpen, setAddPhaseModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [selectedWellForPhase, setSelectedWellForPhase] = useState<Well | null>(null);
  const [selectedPhaseForItem, setSelectedPhaseForItem] = useState<{well: Well, phaseIndex: number, subPhaseIndex: number} | null>(null);
  
  // Search/Filter states
  const [wellSearchAnchor, setWellSearchAnchor] = useState<null | HTMLElement>(null);
  const [wellSearchType, setWellSearchType] = useState<'active' | 'next' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch sites and wells on mount
  useEffect(() => {
    fetchSites();
    fetchAllWells();
  }, []);

  // Filter wells when location changes
  useEffect(() => {
    if (currentLocation && allWells.length > 0) {
      // Filter wells where wellOwner matches current site name
      const filtered = allWells.filter(well => 
        well.wellOwner.toLowerCase() === currentLocation.toLowerCase()
      );
      setLocationWells(filtered);
      
      // For now, just set first well as active for demo
      // You can add logic later to remember which wells were active/next per site
      if (filtered.length > 0) {
        setActiveWell(filtered[0]);
        if (filtered.length > 1) {
          setNextWell(filtered[1]);
        } else {
          setNextWell(null);
        }
      } else {
        setActiveWell(null);
        setNextWell(null);
      }
    }
  }, [currentLocation, allWells]);

  const fetchSites = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SITES, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      }
    } catch (err) {
      console.error('Failed to fetch sites:', err);
    }
  };

  const fetchAllWells = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.WELLS, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch wells');
      const data = await response.json();
      setAllWells(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wells');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWell = (well: Well, type: 'active' | 'next') => {
    if (type === 'active') {
      setActiveWell(well);
    } else {
      setNextWell(well);
    }
    setWellSearchAnchor(null);
  };

  const handleCreateWell = async (wellData: Partial<Well>) => {
    try {
      const response = await fetch(API_ENDPOINTS.WELLS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          ...wellData,
          wellOwner: currentLocation // Automatically set owner to current site
        })
      });

      if (response.ok) {
        const newWell = await response.json();
        setAllWells(prev => [...prev, newWell]);
        setCreateWellModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create well:', err);
    }
  };

  const handleAddPhase = async (wellId: string, phaseName: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}/phases`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ phaseName })
      });

      if (response.ok) {
        const updatedWell = await response.json();
        setAllWells(prev => prev.map(w => w._id === wellId ? updatedWell : w));
        if (activeWell?._id === wellId) setActiveWell(updatedWell);
        if (nextWell?._id === wellId) setNextWell(updatedWell);
        setAddPhaseModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to add phase:', err);
    }
  };

  const handleAddItem = async (
    wellId: string, 
    phaseIndex: number, 
    subPhaseIndex: number, 
    itemData: any
  ) => {
    try {
      const well = allWells.find(w => w._id === wellId);
      if (!well) return;

      const updatedWell = { ...well };
      if (!updatedWell.wellPhases[phaseIndex]?.subPhases[subPhaseIndex]?.items) {
        updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].items = [];
      }
      
      updatedWell.wellPhases[phaseIndex].subPhases[subPhaseIndex].items.push(itemData);

      const response = await fetch(`${API_ENDPOINTS.WELLS}/${wellId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(updatedWell)
      });

      if (response.ok) {
        const savedWell = await response.json();
        setAllWells(prev => prev.map(w => w._id === wellId ? savedWell : w));
        if (activeWell?._id === wellId) setActiveWell(savedWell);
        if (nextWell?._id === wellId) setNextWell(savedWell);
        setAddItemModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };

  // Filter wells for search
  const filteredWells = locationWells.filter(well => 
    well.wellName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    well.wellAFE.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container">Loading equipment data...</div>;
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className="equipment-container">
      {/* Header */}
      <AppBar position="static" className="equipment-header">
        <Toolbar className="header-toolbar">
          <Box className="header-left">
            <Typography variant="h6" className="header-title">
              Equipment List
            </Typography>
            
            {/* Column Controls */}
            <Box className="column-controls">
              <Box className="column-control">
                <Typography variant="caption">Active Well Columns:</Typography>
                <Select
                  value={activeWellColumns}
                  onChange={(e) => setActiveWellColumns(Number(e.target.value))}
                  size="small"
                  className="column-select"
                >
                  {[1,2,3,4].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </Box>
              <Box className="column-control">
                <Typography variant="caption">Next Well Columns:</Typography>
                <Select
                  value={nextWellColumns}
                  onChange={(e) => setNextWellColumns(Number(e.target.value))}
                  size="small"
                  className="column-select"
                >
                  {[1,2,3,4].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>

            {/* Create Well Button */}
            {isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setCreateWellModalOpen(true)}
                className="create-well-btn"
              >
                New Well
              </Button>
            )}
          </Box>

          <Box className="header-center">
            <LocationDropdown
              currentLocation={currentLocation}
              onLocationChange={setCurrentLocation}
              size="small"
            />
          </Box>

          <Box className="header-right">
            <Typography variant="caption" className="dev-credit">
              developed by Mike.Belyayev@exxonmobil.com
            </Typography>
            
            {isAdmin && (
              <IconButton onClick={() => navigate('/admin')} size="small">
                <Settings />
              </IconButton>
            )}
            
            <Typography variant="body2" noWrap className="user-name">
              {user?.userName}
              {isAdmin && " (admin)"}
            </Typography>
            
            <Button variant="text" onClick={logout} size="small" className="logout-btn">
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content - Split View */}
      <Box className="main-content">
        {/* Active Well Section */}
        <Box className="well-section active-well-section">
          <Box className="well-header">
            <Typography variant="h6" className="well-title">
              ACTIVE WELL
              {activeWell && (
                <span className="well-name">{activeWell.wellName}</span>
              )}
            </Typography>
            <Button
              size="small"
              startIcon={<Search />}
              onClick={(e) => {
                setWellSearchAnchor(e.currentTarget);
                setWellSearchType('active');
                setSearchTerm('');
              }}
              className="assign-well-btn"
              disabled={locationWells.length === 0}
            >
              {activeWell ? 'Change' : 'Assign Well'}
            </Button>
          </Box>
          
          {activeWell ? (
            <WellColumn
              well={activeWell}
              columnCount={activeWellColumns}
              onAddPhase={(well) => {
                setSelectedWellForPhase(well);
                setAddPhaseModalOpen(true);
              }}
              onAddItem={(well, phaseIndex, subPhaseIndex) => {
                setSelectedPhaseForItem({ well, phaseIndex, subPhaseIndex });
                setAddItemModalOpen(true);
              }}
              isAdmin={isAdmin}
            />
          ) : (
            <Box className="empty-well-message">
              <Typography>No active well assigned for {currentLocation}</Typography>
              {locationWells.length === 0 && (
                <Typography variant="caption" sx={{ mt: 1, color: '#999' }}>
                  Create a new well first
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Next Well Section */}
        <Box className="well-section next-well-section">
          <Box className="well-header">
            <Typography variant="h6" className="well-title">
              NEXT WELL
              {nextWell && (
                <span className="well-name">{nextWell.wellName}</span>
              )}
            </Typography>
            <Button
              size="small"
              startIcon={<Search />}
              onClick={(e) => {
                setWellSearchAnchor(e.currentTarget);
                setWellSearchType('next');
                setSearchTerm('');
              }}
              className="assign-well-btn"
              disabled={locationWells.length === 0}
            >
              {nextWell ? 'Change' : 'Assign Well'}
            </Button>
          </Box>
          
          {nextWell ? (
            <WellColumn
              well={nextWell}
              columnCount={nextWellColumns}
              onAddPhase={(well) => {
                setSelectedWellForPhase(well);
                setAddPhaseModalOpen(true);
              }}
              onAddItem={(well, phaseIndex, subPhaseIndex) => {
                setSelectedPhaseForItem({ well, phaseIndex, subPhaseIndex });
                setAddItemModalOpen(true);
              }}
              isAdmin={isAdmin}
            />
          ) : (
            <Box className="empty-well-message">
              <Typography>No next well assigned for {currentLocation}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Well Search Popover */}
      <Popover
        open={Boolean(wellSearchAnchor)}
        anchorEl={wellSearchAnchor}
        onClose={() => setWellSearchAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box className="well-search-popover">
          <TextField
            size="small"
            placeholder="Search wells..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            fullWidth
          />
          <Box className="well-search-results">
            {filteredWells.length > 0 ? (
              filteredWells.map(well => (
                <MenuItem
                  key={well._id}
                  onClick={() => wellSearchType && handleAssignWell(well, wellSearchType)}
                  className="well-search-item"
                >
                  <Typography variant="body2" className="well-search-name">
                    {well.wellName}
                  </Typography>
                  <Typography variant="caption" className="well-search-afe">
                    {well.wellAFE}
                  </Typography>
                </MenuItem>
              ))
            ) : (
              <Typography variant="body2" className="no-results">
                No wells found for {currentLocation}
              </Typography>
            )}
          </Box>
        </Box>
      </Popover>

      {/* Modals */}
      <CreateWellModal
        isOpen={createWellModalOpen}
        onClose={() => setCreateWellModalOpen(false)}
        onSubmit={handleCreateWell}
        currentLocation={currentLocation}
      />

      <AddPhaseModal
        isOpen={addPhaseModalOpen}
        onClose={() => {
          setAddPhaseModalOpen(false);
          setSelectedWellForPhase(null);
        }}
        well={selectedWellForPhase}
        onSubmit={handleAddPhase}
      />

      <AddItemModal
        isOpen={addItemModalOpen}
        onClose={() => {
          setAddItemModalOpen(false);
          setSelectedPhaseForItem(null);
        }}
        phaseInfo={selectedPhaseForItem}
        onSubmit={handleAddItem}
      />
    </div>
  );
};

export default EquipmentPage;