import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Button, Card, CardContent, Chip, 
  Tabs, Tab, Divider, List, ListItem, ListItemText, ListItemIcon,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Tooltip
} from '@mui/material';
import { 
  Edit, Delete, ArrowBack, WbSunny, WaterDrop, 
  LocationOn, Terrain, CheckCircle, LocalFlorist, 
  PictureAsPdf, MedicalServices, Timeline, Height
} from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';
import { useTasks } from '../../context/TaskContext';
import { useGrowth } from '../../context/GrowthContext';

const healthColors = {
  'Healthy': 'success',
  'Needs Attention': 'error',
  'Under Observation': 'warning',
};

const taskIcons = {
  Watering: <WaterDrop color="info" />,
  Fertilizing: <LocalFlorist color="success" />,
  Pruning: <Terrain color="secondary" />,
  Repotting: <LocalFlorist color="primary" />,
  'Leaf Cleaning': <CheckCircle color="warning" />,
  'Pest Inspection': <MedicalServices color="error" />,
};

export default function PlantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { getPlantById, deletePlant } = usePlants();
  const { tasks } = useTasks();
  const { entries } = useGrowth();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch plant data
  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const data = await getPlantById(id);
        setPlant(data);
      } catch (err) {
        setError('Failed to load plant details. It might have been deleted.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  // Filter data for this specific plant
  const plantTasks = useMemo(() => {
    return tasks
      .filter(t => t.plantId === id)
      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  }, [tasks, id]);

  const plantGrowth = useMemo(() => {
    return entries
      .filter(e => e.plantId === id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries, id]);

  const handleDelete = async () => {
    try {
      await deletePlant(id);
      navigate('/plants');
    } catch (err) {
      setError('Failed to delete plant.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !plant) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => navigate('/plants')}>Go Back</Button>}>
          {error || 'Plant not found.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box data-aos="fade-in">
      {/* Top Navigation Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Button variant="outlined" color="inherit" startIcon={<ArrowBack />} onClick={() => navigate('/plants')} sx={{ borderRadius: 2 }}>
          Back to Plants
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          
          {/* DOWNLOAD ICON BUTTON - Navigates to Report Page */}
          <Tooltip title="Generate Report">
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate(`/plants/${id}/report`)} 
              sx={{ borderRadius: 2, minWidth: 'auto', px: 2, color: 'primary.dark', borderColor: 'primary.main' }}
            >
              <PictureAsPdf />
            </Button>
          </Tooltip>

          <Button variant="outlined" startIcon={<Edit />} onClick={() => navigate(`/plants/${id}/edit`)} sx={{ borderRadius: 2 }}>
            Edit Plant
          </Button>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={() => setConfirmOpen(true)} sx={{ borderRadius: 2 }}>
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Image & Notes */}
        <Grid item xs={12} md={5}>
          <Card elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 32px rgba(36,75,56,0.08)' }}>
            <Box component="img" src={plant.image} alt={plant.name} sx={{ width: '100%', height: 400, objectFit: 'cover' }} />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" fontWeight={700} color="primary.dark" gutterBottom>{plant.name}</Typography>
              <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
                {plant.scientific || 'Unknown species'}
              </Typography>
              <Chip label={plant.health} color={healthColors[plant.health] || 'default'} sx={{ fontWeight: 600 }} />
            </CardContent>
          </Card>
          
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Notes</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {plant.notes || 'No notes added for this plant yet.'}
            </Typography>
          </Card>
        </Grid>

        {/* Right Column: Specs & History Tabs */}
        <Grid item xs={12} md={7}>
          {/* Specifications Grid */}
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, mb: 4, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Plant Specifications</Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Category</Typography>
                <Chip label={plant.category} size="small" variant="outlined" color="primary" />
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Location</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2">{plant.location || '—'}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Sunlight</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WbSunny fontSize="small" color="warning" />
                  <Typography variant="body2">{plant.sunlight}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Watering</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WaterDrop fontSize="small" color="info" />
                  <Typography variant="body2">{plant.water}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Soil</Typography>
                <Typography variant="body2">{plant.soil || '—'}</Typography>
              </Grid>
            </Grid>

            {plant.symptoms && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MedicalServices color="error" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={600} color="error.main">Health Alert</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Symptoms</Typography>
                    <Typography variant="body2">{plant.symptoms}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Action Taken</Typography>
                    <Typography variant="body2">{plant.actionTaken || 'None yet'}</Typography>
                  </Grid>
                </Grid>
              </>
            )}
          </Card>

          {/* Tabs for History */}
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} textColor="primary" indicatorColor="primary">
                <Tab label={`Care History (${plantTasks.length})`} sx={{ fontWeight: 600 }} />
                <Tab label={`Growth Journal (${plantGrowth.length})`} sx={{ fontWeight: 600 }} />
              </Tabs>
            </Box>
            <CardContent sx={{ p: 0 }}>
              
              {/* CARE HISTORY TAB */}
              {tabValue === 0 && (
                <List>
                  {plantTasks.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="No care history yet" secondary="Complete tasks to see them here" />
                    </ListItem>
                  ) : (
                    plantTasks.map((task, i) => (
                      <Box key={task.id}>
                        <ListItem>
                          <ListItemIcon>{taskIcons[task.type] || <CheckCircle />}</ListItemIcon>
                          <ListItemText 
                            primary={`${task.type} - ${task.status}`} 
                            secondary={task.dueDate}
                            primaryTypographyProps={{ fontWeight: 500 }} 
                          />
                          <Chip 
                            label={task.status} 
                            size="small" 
                            color={task.status === 'Completed' ? 'success' : task.status === 'Pending' ? 'warning' : 'error'} 
                            variant="outlined" 
                          />
                        </ListItem>
                        {i < plantTasks.length - 1 && <Divider component="li" sx={{ ml: 9 }} />}
                      </Box>
                    ))
                  )}
                </List>
              )}

              {/* GROWTH JOURNAL TAB */}
              {tabValue === 1 && (
                <Box>
                  {plantGrowth.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography color="text.secondary" mb={2}>No growth entries found for this plant yet.</Typography>
                      <Button variant="contained" startIcon={<LocalFlorist />} onClick={() => navigate('/growth')} sx={{ borderRadius: 2 }}>
                        Go to Growth Journal
                      </Button>
                    </Box>
                  ) : (
                    <List>
                      {plantGrowth.map((entry, i) => (
                        <Box key={entry.id}>
                          <ListItem alignItems="flex-start">
                            <ListItemIcon sx={{ mt: 1 }}>
                              <Timeline color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Typography variant="subtitle2" fontWeight={600}>{entry.stage} Stage</Typography>
                                  <Chip label={entry.date} size="small" variant="outlined" />
                                </Stack>
                              }
                              secondary={
                                <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Height fontSize="small" color="action" />
                                    <Typography variant="body2">{entry.height || '—'} cm</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocalFlorist fontSize="small" color="success" />
                                    <Typography variant="body2">{entry.leaves || '0'} leaves</Typography>
                                  </Box>
                                </Stack>
                              }
                            />
                          </ListItem>
                          {i < plantGrowth.length - 1 && <Divider component="li" sx={{ ml: 9 }} />}
                        </Box>
                      ))}
                    </List>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Plant?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{plant.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}