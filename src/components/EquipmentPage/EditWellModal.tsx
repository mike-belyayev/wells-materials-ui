// src/components/EquipmentPage/EditWellModal.tsx
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

interface EditWellModalProps {
  isOpen: boolean;
  onClose: () => void;
  well: Well | null;
  onSubmit: (wellId: string, wellData: { wellName: string; wellAFE: string }) => void;
}

const EditWellModal: React.FC<EditWellModalProps> = ({
  isOpen,
  onClose,
  well,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    wellName: '',
    wellAFE: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (well) {
      setFormData({
        wellName: well.wellName || '',
        wellAFE: well.wellAFE || ''
      });
    }
  }, [well]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
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
    if (validate() && well) {
      onSubmit(well._id, formData);
    }
  };

  if (!well) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Well</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Editing well for rig: <strong>{well.wellOwner}</strong>
          </Typography>
          
          <TextField
            name="wellName"
            label="Well Name"
            value={formData.wellName}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
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
            onKeyPress={handleKeyPress}
            error={!!errors.wellAFE}
            helperText={errors.wellAFE}
            fullWidth
            required
            size="small"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Well
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWellModal;