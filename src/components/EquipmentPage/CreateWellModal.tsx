// src/components/EquipmentPage/CreateWellModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';

interface CreateWellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wellData: {
    wellName: string;
    wellAFE: string;
    wellOwner: string;
    wellPhases: [];
  }) => void;
  currentLocation: string; // Add this
}

const CreateWellModal: React.FC<CreateWellModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentLocation
}) => {
  const [formData, setFormData] = useState({
    wellName: '',
    wellAFE: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.wellName.trim()) {
      newErrors.wellName = 'Well name is required';
    }
    
    if (!formData.wellAFE.trim()) {
      newErrors.wellAFE = 'AFE number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...formData,
        wellOwner: currentLocation, // Auto-set to current site
        wellPhases: []
      });
      setFormData({ wellName: '', wellAFE: '' });
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Well for {currentLocation}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Creating a new well for <strong>{currentLocation}</strong>. The well owner will be automatically set to this site.
          </Alert>
          
          <TextField
            name="wellName"
            label="Well Name"
            value={formData.wellName}
            onChange={handleChange}
            error={!!errors.wellName}
            helperText={errors.wellName}
            fullWidth
            required
            size="small"
            autoFocus
          />
          
          <TextField
            name="wellAFE"
            label="AFE Number"
            value={formData.wellAFE}
            onChange={handleChange}
            error={!!errors.wellAFE}
            helperText={errors.wellAFE}
            fullWidth
            required
            size="small"
          />
          
          <TextField
            label="Well Owner (Site)"
            value={currentLocation}
            fullWidth
            size="small"
            disabled
            helperText="Auto-set to current site"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Well
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateWellModal;