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
  Alert,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import { Create, ContentCopy } from '@mui/icons-material';
import CloneWellSelector from './CloneWellSelector';

interface CreateWellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wellData: {
    wellName: string;
    wellAFE: string;
    wellOwner: string;
    wellPhases: [];
  }) => void;
  onCloneWell: (wellId: string) => Promise<void>; // New prop for cloning
  currentLocation: string;
  loading?: boolean; // Optional loading state
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`well-tabpanel-${index}`}
      aria-labelledby={`well-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const CreateWellModal: React.FC<CreateWellModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onCloneWell,
  currentLocation,
  loading = false
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    wellName: '',
    wellAFE: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [cloneSelectorOpen, setCloneSelectorOpen] = useState(false);

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
        wellOwner: currentLocation,
        wellPhases: []
      });
      setFormData({ wellName: '', wellAFE: '' });
      onClose();
    }
  };

  const handleClone = async (wellId: string) => {
    await onCloneWell(wellId);
    setCloneSelectorOpen(false);
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Well for {currentLocation}</DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="well creation options">
              <Tab icon={<Create />} label="Create New" iconPosition="start" />
              <Tab icon={<ContentCopy />} label="Clone Existing" iconPosition="start" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
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
              sx={{ mb: 2 }}
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
              sx={{ mb: 2 }}
            />
            
            <TextField
              label="Well Owner (Site)"
              value={currentLocation}
              fullWidth
              size="small"
              disabled
              helperText="Auto-set to current site"
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Clone an existing well with all its phases, subphases, and items. 
              The new well will be named "<strong>Clone of: [Original Name]</strong>" 
              and will be assigned to {currentLocation}.
            </Alert>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<ContentCopy />}
              onClick={() => setCloneSelectorOpen(true)}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Select Well to Clone
            </Button>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          {tabValue === 0 && (
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              Create Well
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Clone Well Selector Modal */}
      <CloneWellSelector
        isOpen={cloneSelectorOpen}
        onClose={() => setCloneSelectorOpen(false)}
        onClone={handleClone}
        currentLocation={currentLocation}
      />
    </>
  );
};

export default CreateWellModal;