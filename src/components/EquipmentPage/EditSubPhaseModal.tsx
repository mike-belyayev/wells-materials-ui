// src/components/EquipmentPage/EditSubPhaseModal.tsx
import { useState, useEffect } from 'react';
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

interface EditSubPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  subPhaseInfo: {
    well: Well;
    phaseIndex: number;
    subPhaseIndex: number;
    subPhaseName: string;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseIndex: number, subPhaseName: string) => void;
}

const EditSubPhaseModal: React.FC<EditSubPhaseModalProps> = ({
  isOpen,
  onClose,
  subPhaseInfo,
  onSubmit
}) => {
  const [subPhaseName, setSubPhaseName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (subPhaseInfo) {
      setSubPhaseName(subPhaseInfo.subPhaseName);
    }
  }, [subPhaseInfo]);

  const handleSubmit = () => {
    if (!subPhaseName.trim()) {
      setError('Subphase name is required');
      return;
    }
    
    if (subPhaseInfo) {
      onSubmit(
        subPhaseInfo.well._id, 
        subPhaseInfo.phaseIndex, 
        subPhaseInfo.subPhaseIndex, 
        subPhaseName.trim()
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!subPhaseInfo) return null;

  const { well, phaseIndex } = subPhaseInfo;
  const phase = well.wellPhases[phaseIndex];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Subphase</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Editing subphase in: <strong>{well.wellName}</strong> → <strong>{phase?.phaseName}</strong>
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
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Subphase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSubPhaseModal;