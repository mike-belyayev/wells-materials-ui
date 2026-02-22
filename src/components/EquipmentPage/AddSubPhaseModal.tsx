// src/components/EquipmentPage/AddSubPhaseModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography
} from '@mui/material';
import type { Well } from '../../types';

interface AddSubPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseInfo: {
    well: Well;
    phaseIndex: number;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseName: string) => void;
}

const AddSubPhaseModal: React.FC<AddSubPhaseModalProps> = ({
  isOpen,
  onClose,
  phaseInfo,
  onSubmit
}) => {
  const [subPhaseName, setSubPhaseName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!subPhaseName.trim()) {
      setError('Subphase name is required');
      return;
    }
    
    if (phaseInfo) {
      onSubmit(phaseInfo.well._id, phaseInfo.phaseIndex, subPhaseName.trim());
      setSubPhaseName('');
      setError('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleClose = () => {
    setSubPhaseName('');
    setError('');
    onClose();
  };

  if (!phaseInfo) return null;

  const { well, phaseIndex } = phaseInfo;
  const phase = well.wellPhases[phaseIndex];

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Subphase</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Adding subphase to: <strong>{well.wellName}</strong> → 
            <strong>{phase?.phaseName}</strong>
          </Typography>
          
          <TextField
            label="Subphase Name"
            value={subPhaseName}
            onChange={(e) => {
              setSubPhaseName(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            fullWidth
            required
            size="small"
            autoFocus
            placeholder="e.g., Casing, Cementing, Testing"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Subphase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddSubPhaseModal;