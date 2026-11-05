import { useState } from 'react';
import {
  Box, Typography, Grid, Card, Button, List, ListItem, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  IconButton, CircularProgress, Alert
} from '@mui/material';
import { Edit, Warning, CheckCircle, Search, LocalHospital, Close } from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';
import { useHealth } from '../../context/HealthContext';

export default function PlantHealth() {
  const { plants, updatePlant, loading: plantsLoading } = usePlants();
  const { addRecord, updateRecord } = useHealth();

  const [openModal, setOpenModal] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState(null);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    symptoms: '',
    severity: 'Low',
    description: '',
    actionTaken: '',
    status: 'Under Observation',
    image: '',
  });

  const selectedPlant = plants.find(p => p.id === editingPlantId);

  // Compute stats
  const healthyCount = plants.filter(p => p.health === 'Healthy').length;
  const attentionCount = plants.filter(p => p.health === 'Needs Attention').length;
  const observationCount = plants.filter(p => p.health === 'Under Observation').length;

  const handleOpenEdit = (plant) => {
    setEditingPlantId(plant.id);
    setEditingRecordId(plant.healthRecordId || null); 
    setFormData({
      symptoms: plant.symptoms || '',
      severity: plant.severity || 'Low',
      description: plant.healthNotes || '',
      actionTaken: plant.actionTaken || '',
      status: plant.health, // Load current health status
      image: plant.healthImage || '',
    });
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save to Health Records (create or update)
      const recordPayload = {
        plantId: editingPlantId,
        plantName: selectedPlant.name,
        ...formData,
      };

      if (editingRecordId) {
        await updateRecord(editingRecordId, recordPayload);
      } else {
        await addRecord(recordPayload);
      }

      // 2. Update the Plant's global health status
      await updatePlant(editingPlantId, {
        health: formData.status,
        symptoms: formData.symptoms,
        severity: formData.severity,
        healthNotes: formData.description,
        actionTaken: formData.actionTaken,
        healthImage: formData.image,
      });

      setOpenModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (plantsLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} color="primary.dark">Plant Health</Typography>
        <Typography variant="body1" color="text.secondary">Monitor symptoms and recovery.</Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider' }}>
            <CheckCircle color="success" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>{healthyCount}</Typography>
              <Typography variant="body2" color="text.secondary">Healthy Plants</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider' }}>
            <Warning color="warning" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>{attentionCount}</Typography>
              <Typography variant="body2" color="text.secondary">Needs Attention</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: 'divider' }}>
            <Search color="info" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>{observationCount}</Typography>
              <Typography variant="body2" color="text.secondary">Under Observation</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Plants List */}
      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight={600}>Plant Health Records</Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {plants.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No plants yet. Add one to get started!</Typography>
            </Box>
          ) : (
            plants.map((plant, i) => (
              <Box key={plant.id}>
                <ListItem sx={{ py: 2.5, px: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
                    <Box
                      component="img"
                      src={plant.image}
                      alt={plant.name}
                      sx={{ width: 48, height: 48, borderRadius: 2, objectFit: 'cover' }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{plant.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {plant.symptoms ? `Symptom: ${plant.symptoms}` : 'No active symptoms'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={plant.health}
                      size="small"
                      color={plant.health === 'Needs Attention' ? 'error' : plant.health === 'Healthy' ? 'success' : 'warning'}
                      variant="outlined"
                    />
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleOpenEdit(plant)}
                      sx={{ borderRadius: 2 }}
                    >
                      Edit Status
                    </Button>
                  </Box>
                </ListItem>
                {i < plants.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Card>

      {/* Edit Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          Update Health for {selectedPlant?.name}
          <IconButton onClick={() => setOpenModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>

        <form onSubmit={handleSave}>
          <DialogContent>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Health Status" value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <MenuItem value="Healthy">Healthy</MenuItem>
                  <MenuItem value="Needs Attention">Needs Attention</MenuItem>
                  <MenuItem value="Under Observation">Under Observation</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select fullWidth label="Severity" value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Symptoms" value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="e.g. Yellowing tips, drooping leaves"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={2} label="Description" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth multiline rows={2} label="Action Taken" value={formData.actionTaken}
                  onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                  placeholder="e.g. Reduced watering, moved to shade"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Photo Evidence URL" value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ px: 4 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}