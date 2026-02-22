import { useState, useEffect } from 'react'; // Add useEffect
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom'; // Add useNavigate

const HomePage = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading, user } = useAuth(); // Add user from useAuth
  const navigate = useNavigate(); // Add navigate

  // Redirect to equipment page if already logged in
  useEffect(() => {
    if (user) {
      navigate('/equipment', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(userName, password);
    // No need to navigate here - the useEffect above will handle it
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: 400,
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ 
          textAlign: 'center', 
          color: 'primary.main', 
          fontWeight: 600 
        }}>
          Wells Materials Management
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            type="text"
            fullWidth
            margin="normal"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            helperText="Enter your username"
          />
          
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 3, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Contact an administrator to create an account
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;