// src/components/EquipmentPage/AddPhaseModal.tsx
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

interface AddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  well: Well | null;
  onSubmit: (wellId: string, phaseName: string) => void;
}

const AddPhaseModal: React.FC<AddPhaseModalProps> = ({
  isOpen,
  onClose,
  well,
  onSubmit
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!phaseName.trim()) {
      setError('Phase name is required');
      return;
    }
    
    if (well) {
      onSubmit(well._id, phaseName.trim());
      setPhaseName('');
      setError('');
    }
  };

  const handleClose = () => {
    setPhaseName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Phase</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {well && (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Adding phase to: <strong>{well.wellName}</strong>
            </Typography>
          )}
          
          <TextField
            label="Phase Name"
            value={phaseName}
            onChange={(e) => {
              setPhaseName(e.target.value);
              setError('');
            }}
            error={!!error}
            helperText={error}
            fullWidth
            required
            size="small"
            autoFocus
            placeholder="e.g., Drilling, Completion, Production"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Phase
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPhaseModal;