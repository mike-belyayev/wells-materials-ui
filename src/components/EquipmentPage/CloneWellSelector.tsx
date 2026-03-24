// src/components/EquipmentPage/CloneWellSelector.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Typography,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Search, ContentCopy } from '@mui/icons-material';
import { API_ENDPOINTS } from '../../config/api';
import type { Well } from '../../types';

interface CloneWellSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onClone: (wellId: string) => void;
  currentLocation: string;
  excludeWellIds?: string[]; // Optional: exclude already assigned wells
}

const CloneWellSelector: React.FC<CloneWellSelectorProps> = ({
  isOpen,
  onClose,
  onClone,
  excludeWellIds = []
}) => {
  const [wells, setWells] = useState<Well[]>([]);
  const [filteredWells, setFilteredWells] = useState<Well[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchWells();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter wells based on search term and exclude list
    let filtered = wells.filter(well => 
      !excludeWellIds.includes(well._id) &&
      (well.wellName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       well.wellAFE.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredWells(filtered);
  }, [searchTerm, wells, excludeWellIds]);

  const fetchWells = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINTS.WELLS);
      if (!response.ok) throw new Error('Failed to fetch wells');
      const data = await response.json();
      
      // Filter to only wells from the same location? Or show all?
      // Showing all wells from all locations for cloning flexibility
      setWells(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wells');
    } finally {
      setLoading(false);
    }
  };

  const handleClone = (wellId: string) => {
    onClone(wellId);
    onClose();
    setSearchTerm('');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Clone Existing Well</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Select a well to clone. The new well will be created as "<strong>Clone of: [Original Name]</strong>" 
            with all phases, subphases, and items copied exactly.
          </Alert>
          
          <TextField
            placeholder="Search wells by name or AFE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            autoFocus
          />
          
          <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 1 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : filteredWells.length === 0 ? (
              <Alert severity="info">
                {searchTerm ? 'No wells match your search' : 'No wells available to clone'}
              </Alert>
            ) : (
              filteredWells.map((well) => (
                <MenuItem
                  key={well._id}
                  onClick={() => handleClone(well._id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: '1px solid #f0f0f0'
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {well.wellName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      AFE: {well.wellAFE} | Owner: {well.wellOwner}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Phases: {well.wellPhases?.length || 0} | 
                      Subphases: {well.wellPhases?.reduce((total, phase) => 
                        total + (phase.subPhases?.length || 0), 0) || 0} | 
                      Items: {well.wellPhases?.reduce((total, phase) => 
                        total + phase.subPhases?.reduce((subTotal, subPhase) => 
                          subTotal + (subPhase.items?.length || 0), 0) || 0, 0) || 0}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopy />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClone(well._id);
                    }}
                  >
                    Clone
                  </Button>
                </MenuItem>
              ))
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloneWellSelector;