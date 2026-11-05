import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Button, TextField, MenuItem, 
  Card, CardContent, Divider, Avatar, InputAdornment, CircularProgress, Alert 
} from '@mui/material';
import { 
  ArrowBack, Save, Spa, WaterDrop 
} from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';

export default function AddPlant() {
  const navigate = useNavigate();
  const { addPlant } = usePlants();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. All form data lives in one state object
  const [formData, setFormData] = useState({
    name: '',
    scientific: '',
    category: 'Foliage',
    location: '',
    sunlight: 'Indirect',
    water: 'Weekly',
    soil: '',
    notes: '',
    health: 'Healthy',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
  });

  // 2. Update state when the user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Submit (Connect to API)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form refresh
    
    if (!formData.name.trim()) {
      setError('Plant name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addPlant(formData);
      // Redirect to MyPlants page after success
      navigate('/plants'); 
    } catch (err) {
      console.error(err);
      setError('Failed to save plant. Please check your JSON Server.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }} data-aos="fade-up">
      
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={() => navigate('/plants')} // Changed from href to onClick
          sx={{ minWidth: 0, p: 1, borderRadius: 2 }}
        >
          <ArrowBack />
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Add New Plant</Typography>
          <Typography variant="body1" color="text.secondary">Grow your indoor jungle.</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* 4. Form onSubmit is connected to handleSubmit */}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          
          {/* Left Column: Image Preview */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h6" fontWeight={600} mb={3} color="primary.dark">Plant Photo</Typography>
                
                <Avatar 
                  src={formData.image}
                  variant="rounded"
                  sx={{ width: 200, height: 200, mb: 3, borderRadius: 4 }}
                />
                
                <TextField 
                  fullWidth 
                  size="small" 
                  label="Image URL" 
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Form Fields */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ borderRadius: 4, p: 4, border: '1px solid', borderColor: 'divider' }}>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Spa color="primary" />
                <Typography variant="h6" fontWeight={600}>Basic Information</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  {/* 5. Added name, value, and onChange to every input */}
                  <TextField fullWidth label="Plant Name" name="name" value={formData.name} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Scientific Name" name="scientific" value={formData.scientific} onChange={handleChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Category" name="category" value={formData.category} onChange={handleChange}>
                    <MenuItem value="Foliage">Foliage</MenuItem>
                    <MenuItem value="Succulent">Succulent</MenuItem>
                    <MenuItem value="Flowering">Flowering</MenuItem>
                    <MenuItem value="Cactus">Cactus</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Location" name="location" value={formData.location} onChange={handleChange} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WaterDrop color="primary" />
                <Typography variant="h6" fontWeight={600}>Care Details</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Sunlight Requirement" name="sunlight" value={formData.sunlight} onChange={handleChange}>
                    <MenuItem value="Low">Low Light</MenuItem>
                    <MenuItem value="Indirect">Indirect Light</MenuItem>
                    <MenuItem value="Bright">Bright Indirect</MenuItem>
                    <MenuItem value="Direct">Direct Sun</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Watering" name="water" value={formData.water} onChange={handleChange}>
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Soil Type" name="soil" value={formData.soil} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={3} label="Notes" name="notes" value={formData.notes} onChange={handleChange} />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 5 }}>
                <Button variant="outlined" color="inherit" onClick={() => navigate('/plants')} sx={{ borderRadius: 2, px: 3 }}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />} 
                  disabled={loading}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  {loading ? 'Saving...' : 'Save Plant'}
                </Button>
              </Box>

            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}