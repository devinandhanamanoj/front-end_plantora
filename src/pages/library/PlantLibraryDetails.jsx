import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Button, Card, CardContent, Chip, Divider, 
  CircularProgress, Alert, Stack, Snackbar
} from '@mui/material';
import { 
  ArrowBack, WbSunny, WaterDrop, Spa, Thermostat, Opacity, Add
} from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';

export default function PlantLibraryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { library, plants, addPlant } = usePlants();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Snackbar state for alerts
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (library.length > 0) {
      const found = library.find(p => p.id.toString() === id.toString());
      setPlant(found);
      setLoading(false);
    }
  }, [library, id]);

  const handleAddToMyPlants = async () => {
    // 1. Check for duplicates
    const isAlreadyAdded = plants.some(p => p.name.toLowerCase() === plant.commonName.toLowerCase());
    
    if (isAlreadyAdded) {
      setSnack({ 
        open: true, 
        message: `${plant.commonName} is already in your collection!`, 
        severity: 'warning' 
      });
      return;
    }

    // 2. Add plant
    setSaving(true);
    try {
      await addPlant({
        name: plant.commonName,
        scientific: plant.scientificName,
        category: plant.category,
        image: plant.image,
        location: 'Not set',
        sunlight: plant.sunlight,
        water: plant.watering,
        soil: 'Standard potting mix',
        notes: plant.description,
        health: 'Healthy',
      });
      setSnack({ open: true, message: `${plant.commonName} added to My Plants!`, severity: 'success' });
      setTimeout(() => navigate('/plants'), 1000);
    } catch (err) {
      setSnack({ open: true, message: 'Failed to add plant.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!plant) return <Alert severity="error">Plant not found in library.</Alert>;

  return (
    <Box data-aos="fade-in">
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/library')} sx={{ borderRadius: 2 }}>
          Back to Library
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Box component="img" src={plant.image} alt={plant.commonName} sx={{ width: '100%', height: 400, objectFit: 'cover' }} />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h3" fontWeight={700} color="primary.dark" gutterBottom>
                {plant.commonName}
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                {plant.scientificName}
              </Typography>
              
              <Stack direction="row" spacing={2} mb={3}>
                <Chip label={plant.category} color="primary" />
                <Chip label={`Difficulty: ${plant.difficulty}`} color={plant.difficulty === 'Easy' ? 'success' : plant.difficulty === 'Medium' ? 'warning' : 'error'} />
              </Stack>

              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {plant.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 4, mb: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" fontWeight={600} mb={3}>Plant Specifications</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Sunlight</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WbSunny color="warning" /> <Typography variant="body1">{plant.sunlight}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Watering</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterDrop color="info" /> <Typography variant="body1">{plant.watering}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Humidity</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Opacity color="action" /> <Typography variant="body1">{plant.humidity || 'Medium'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Temperature</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Thermostat color="error" /> <Typography variant="body1">{plant.temperature || '18-24°C'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Soil</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Spa color="success" /> <Typography variant="body1">{plant.soil || 'Standard potting mix'}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 4, p: 4, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>Ready to grow this?</Typography>
            <Button 
              variant="contained" 
              size="large" 
              fullWidth 
              startIcon={<Add />}
              onClick={handleAddToMyPlants}
              disabled={saving}
              sx={{ borderRadius: 2, py: 1.5, fontSize: '1.1rem' }}
            >
              {saving ? 'Adding...' : 'Add to My Plants'}
            </Button>
          </Card>
        </Grid>
      </Grid>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={4000} 
        onClose={() => setSnack({ ...snack, open: false })} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2, fontWeight: 500 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}