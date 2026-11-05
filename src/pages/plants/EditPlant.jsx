import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Button, TextField, MenuItem, 
  Card, CardContent, Divider, Avatar, InputAdornment,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { 
  ArrowBack, Save, Spa, WaterDrop, Delete 
} from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';

export default function EditPlant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlantById, updatePlant, deletePlant } = usePlants();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Empty state initially, will be filled by API
  const [formData, setFormData] = useState({
    name: '', scientific: '', category: 'Foliage',
    location: '', sunlight: 'Indirect', water: 'Weekly', 
    soil: '', notes: '', health: 'Healthy', image: ''
  });

  // Fetch plant data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPlantById(id);
        setFormData({
          ...data,
          // Fallback defaults in case the DB has missing fields
          scientific: data.scientific || '',
          location: data.location || '',
          soil: data.soil || '',
          notes: data.notes || ''
        });
      } catch (err) {
        setError('Failed to load plant details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError('Plant name is required.');

    setSaving(true);
    setError(null);
    try {
      await updatePlant(id, formData);
      navigate('/plants'); // Go back to list on success
    } catch (err) {
      setError('Failed to update plant.');
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlant(id);
      navigate('/plants');
    } catch (err) {
      setError('Failed to delete plant.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  
  if (error && !formData.name) {
    return <Alert severity="error" action={<Button onClick={() => navigate('/plants')}>Go Back</Button>}>{error}</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }} data-aos="fade-up">
      
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={() => navigate('/plants')} 
          sx={{ minWidth: 0, p: 1, borderRadius: 2 }}
        >
          <ArrowBack />
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Edit Plant</Typography>
          <Typography variant="body1" color="text.secondary">Update details for {formData.name}.</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          
          {/* Left Column: Image Upload */}
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
                  sx={{ mt: 1 }}
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
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Health Status" name="health" value={formData.health} onChange={handleChange}>
                    <MenuItem value="Healthy">Healthy</MenuItem>
                    <MenuItem value="Needs Attention">Needs Attention</MenuItem>
                    <MenuItem value="Under Observation">Under Observation</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <WaterDrop color="primary" />
                <Typography variant="h6" fontWeight={600}>Care Details</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Sunlight" name="sunlight" value={formData.sunlight} onChange={handleChange}>
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
                  startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />} 
                  disabled={saving}
                  sx={{ borderRadius: 2, px: 4 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>

              <Divider sx={{ my: 4 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2, opacity: 0.8 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="error.dark">Delete this plant</Typography>
                  <Typography variant="caption" color="error.dark">Once deleted, all data will be lost.</Typography>
                </Box>
                <Button onClick={() => setConfirmDelete(true)} variant="contained" color="error" startIcon={<Delete />} sx={{ borderRadius: 2 }}>
                  Delete
                </Button>
              </Box>

            </Card>
          </Grid>
        </Grid>
      </form>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete Plant?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{formData.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}