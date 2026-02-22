// src/components/EquipmentPage/EditItemModal.tsx
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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Well, Item, ItemStatus } from '../../types';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemInfo: {
    well: Well;
    phaseIndex: number;
    subPhaseIndex: number;
    itemIndex: number;
    item: Item;
  } | null;
  onSubmit: (wellId: string, phaseIndex: number, subPhaseIndex: number, itemIndex: number, itemData: any) => void;
}

const statusOptions = [
  { value: 'neutral', label: 'Neutral', color: '#757575' },
  { value: 'green', label: 'Green', color: '#4caf50' },
  { value: 'orange', label: 'Orange', color: '#ff9800' },
  { value: 'red', label: 'Red', color: '#f44336' }
];

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  itemInfo,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    itemName: '',
    itemQuantity: '',
    itemDescription: '',
    itemLocation: '',
    itemState: 'neutral' as ItemStatus,
    itemComment: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (itemInfo) {
      setFormData({
        itemName: itemInfo.item.itemName || '',
        itemQuantity: itemInfo.item.itemQuantity || '',
        itemDescription: itemInfo.item.itemDescription || '',
        itemLocation: itemInfo.item.itemLocation || '',
        itemState: itemInfo.item.itemState || 'neutral',
        itemComment: itemInfo.item.itemComment || ''
      });
    }
  }, [itemInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleStatusChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, itemState: e.target.value as ItemStatus }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'textarea') {
      handleSubmit();
    }
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Item name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && itemInfo) {
      const { well, phaseIndex, subPhaseIndex, itemIndex } = itemInfo;
      
      // Clean up empty fields
      const cleanData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );
      
      onSubmit(well._id, phaseIndex, subPhaseIndex, itemIndex, cleanData);
    }
  };

  if (!itemInfo) return null;

  const { well, phaseIndex, subPhaseIndex } = itemInfo;
  const phase = well.wellPhases[phaseIndex];
  const subPhase = phase?.subPhases[subPhaseIndex];

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Item</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Editing item in: <strong>{well.wellName}</strong> → 
            <strong>{phase?.phaseName}</strong> → 
            <strong>{subPhase?.subPhaseName}</strong>
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="itemName"
                label="Item Name *"
                value={formData.itemName}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                error={!!errors.itemName}
                helperText={errors.itemName}
                fullWidth
                required
                size="small"
                autoFocus
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                name="itemQuantity"
                label="Quantity"
                value={formData.itemQuantity}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                fullWidth
                size="small"
                placeholder="e.g., 5, 100m, 2 sets"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                name="itemLocation"
                label="Location"
                value={formData.itemLocation}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                fullWidth
                size="small"
                placeholder="e.g., Warehouse A, Site B"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                name="itemDescription"
                label="Description"
                value={formData.itemDescription}
                onChange={handleChange}
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Detailed description of the item"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="itemState"
                  value={formData.itemState}
                  onChange={handleStatusChange}
                  label="Status"
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: option.color 
                        }} />
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                name="itemComment"
                label="Comments"
                value={formData.itemComment}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                fullWidth
                size="small"
                placeholder="Additional notes"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Update Item
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditItemModal;