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
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { Delete } from '@mui/icons-material';
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
  onSubmit: (wellId: string, phaseIndex: number, subPhaseIndex: number, newSubPhaseName: string) => void;
  onDelete?: (wellId: string, phaseIndex: number, subPhaseIndex: number) => void;
}

const EditSubPhaseModal: React.FC<EditSubPhaseModalProps> = ({
  isOpen,
  onClose,
  subPhaseInfo,
  onSubmit,
  onDelete
}) => {
  const [subPhaseName, setSubPhaseName] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  useEffect(() => {
    if (subPhaseInfo) {
      setSubPhaseName(subPhaseInfo.subPhaseName);
      setError('');
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

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (subPhaseInfo && onDelete) {
      onDelete(
        subPhaseInfo.well._id, 
        subPhaseInfo.phaseIndex, 
        subPhaseInfo.subPhaseIndex
      );
      setDeleteConfirmOpen(false);
      setSnackbar({ open: true, message: 'Subphase deleted successfully' });
      onClose();
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  if (!subPhaseInfo) return null;

  const { well, phaseIndex } = subPhaseInfo;
  const phase = well.wellPhases[phaseIndex];

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Edit Subphase</span>
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
                Delete Subphase
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Editing subphase in: <strong>{well.wellName}</strong> → 
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
              autoFocus
              size="small"
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: '#d32f2f' }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this subphase?
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Subphase: <strong>{subPhaseName}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Phase: <strong>{phase?.phaseName}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
            Well: <strong>{well.wellName}</strong>
          </Typography>
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            This will delete ALL items within this subphase. This action cannot be undone.
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

export default EditSubPhaseModal;