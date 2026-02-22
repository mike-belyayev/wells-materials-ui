// src/components/EquipmentPage/EditPhaseModal.tsx
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

interface EditPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseInfo: {
    well: Well;
    phaseIndex: number;
    phaseName: string;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, phaseName: string) => void;
}

const EditPhaseModal: React.FC<EditPhaseModalProps> = ({
  isOpen,
  onClose,
  phaseInfo,
  onSubmit
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (phaseInfo) {
      setPhaseName(phaseInfo.phaseName);
    }
  }, [phaseInfo]);

  const handleSubmit = () => {
    if (!phaseName.trim()) {
      setError('Phase name is required');
      return;
    }
    
    if (phaseInfo) {
      onSubmit(phaseInfo.well._id, phaseInfo.phaseIndex, phaseName.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!phaseInfo) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Phase</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Editing phase in: <strong>{phaseInfo.well.wellName}</strong>
          </Typography>
          
          <TextField
            label="Phase Name"
            value={phaseName}
            onChange={(e) => {
              setPhaseName(e.target.value);
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
          Update Phase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPhaseModal;