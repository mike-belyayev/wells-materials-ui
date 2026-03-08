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
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { Well } from '../../types';

interface EditPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phaseInfo: {
    well: Well;
    phaseIndex: number;
    phaseName: string;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, newPhaseName: string) => void;
  onDelete?: (wellId: string, phaseIndex: number) => void;
}

const EditPhaseModal: React.FC<EditPhaseModalProps> = ({
  isOpen,
  onClose,
  phaseInfo,
  onSubmit,
  onDelete
}) => {
  const [phaseName, setPhaseName] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    if (phaseInfo) {
      setPhaseName(phaseInfo.phaseName);
      setError('');
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

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (phaseInfo && onDelete) {
      onDelete(phaseInfo.well._id, phaseInfo.phaseIndex);
      setDeleteConfirmOpen(false);
      setSnackbar({ open: true, message: 'Phase deleted successfully' });
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  if (!phaseInfo) return null;

  const { well } = phaseInfo;

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Edit Phase</span>
            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={handleDeleteClick}
                sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    borderColor: '#d32f2f',
                  }
                }}
              >
                Delete Phase
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Editing phase in well: <strong>{well.wellName}</strong>
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
              autoFocus
              size="small"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#d32f2f' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this phase?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Phase: <strong>{phaseName}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Well: <strong>{well.wellName}</strong>
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            This will delete ALL subphases and items within this phase. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Just Kidding!</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Roger That!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EditPhaseModal;