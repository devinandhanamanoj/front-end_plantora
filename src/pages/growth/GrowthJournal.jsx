import { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, Button, Avatar, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, IconButton, Stack, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
  Add, Height, LocalFlorist, CalendarToday, Close, Timeline, Spa, ExpandMore
} from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';
import { useGrowth } from '../../context/GrowthContext';

export default function GrowthJournal() {
  const { plants } = usePlants();
  const { entries, addEntry, loading } = useGrowth();

  const [selectedPlantId, setSelectedPlantId] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().slice(0, 10),
    height: '',
    leaves: '',
    stage: 'Vegetative',
    image: '',
    notes: '',
  });

  // Auto-select the first plant when the page loads
  useEffect(() => {
    if (plants.length > 0 && !selectedPlantId) {
      setSelectedPlantId(plants[0].id);
    }
  }, [plants, selectedPlantId]);

  const selectedPlant = plants.find(p => p.id === selectedPlantId);

  // Filter entries for ONLY the selected plant
  const plantEntries = useMemo(() => {
    if (!selectedPlantId) return [];
    return entries
      .filter(e => e.plantId === selectedPlantId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // newest first
  }, [entries, selectedPlantId]);

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!selectedPlantId || !newEntry.date) return;

    setSaving(true);
    try {
      await addEntry({
        plantId: selectedPlantId,
        plantName: selectedPlant.name,
        ...newEntry,
      });
      setSnack({ open: true, message: 'Growth entry saved!', severity: 'success' });
      setOpenModal(false);
      setNewEntry({
        date: new Date().toISOString().slice(0, 10),
        height: '',
        leaves: '',
        stage: 'Vegetative',
        image: '',
        notes: '',
      });
    } catch (err) {
      setSnack({ open: true, message: 'Failed to save entry.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Growth Journal</Typography>
          <Typography variant="body1" color="text.secondary">Track the journey of your plants.</Typography>
        </Box>
      </Box>

      {/* PLANT SELECTOR (Dropdown) */}
      <Card elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select a Plant"
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {plants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>
                  {plant.name} — {plant.scientific}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {selectedPlant && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={selectedPlant.image} sx={{ width: 48, height: 48, border: '2px solid #E8EFE4' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{selectedPlant.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {plantEntries.length} {plantEntries.length === 1 ? 'entry' : 'entries'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenModal(true)}
                  sx={{ borderRadius: 2 }}
                >
                  Add Entry
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Card>

      {/* TIMELINE SECTION */}
      {!selectedPlant ? (
        <Card elevation={0} sx={{ borderRadius: 4, p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <Spa sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Select a plant from the dropdown</Typography>
        </Card>
      ) : plantEntries.length === 0 ? (
        <Card elevation={0} sx={{ borderRadius: 4, p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <Timeline sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No entries for {selectedPlant.name} yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Start tracking how it grows over time.</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)} sx={{ borderRadius: 2 }}>
            Add First Entry
          </Button>
        </Card>
      ) : (
        <Card elevation={0} sx={{ borderRadius: 4, p: 4, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>{selectedPlant.name}'s Journey</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedPlant.category} • {plantEntries.length} total entries
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: 'relative',
              pl: 4,
              '&::before': { content: '""', position: 'absolute', left: 7, top: 8, bottom: 0, width: 2, bgcolor: 'divider' },
            }}
          >
            {plantEntries.map((entry, index) => (
              <Box
                key={entry.id}
                sx={{ position: 'relative', mb: 4, cursor: 'pointer' }}
                data-aos="fade-left"
                data-aos-delay={index * 50}
                onClick={() => setSelectedEntry(entry)}
              >
                {/* Timeline Dot */}
                <Box sx={{ position: 'absolute', left: -33, top: 4, width: 16, height: 16, borderRadius: '50%', bgcolor: 'primary.main', border: '3px solid', borderColor: 'background.paper', zIndex: 1 }} />
                
                <Card variant="outlined" sx={{ borderRadius: 3, p: 2, transition: '0.2s', '&:hover': { bgcolor: 'action.hover', transform: 'translateX(4px)' } }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar src={entry.image || selectedPlant.image} variant="rounded" sx={{ width: 64, height: 64 }} />
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>{entry.stage} Stage</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 12 }} /> {new Date(entry.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 3, mb: 1 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.secondary">
                          <Height fontSize="small" color="primary" /> {entry.height || '—'} cm
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.secondary">
                          <LocalFlorist fontSize="small" color="success" /> {entry.leaves || '0'} leaves
                        </Typography>
                      </Box>
                      {entry.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          "{entry.notes}"
                        </Typography>
                      )}
                    </Box>
                    <ExpandMore sx={{ color: 'action.active' }} />
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      {/* ADD ENTRY DIALOG */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          Add Growth Entry for {selectedPlant?.name}
          <IconButton onClick={() => setOpenModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>

        <form onSubmit={handleSaveEntry}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField fullWidth label="Date" type="date" value={newEntry.date} onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })} InputLabelProps={{ shrink: true }} required />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField fullWidth label="Height (cm)" type="number" value={newEntry.height} onChange={(e) => setNewEntry({ ...newEntry, height: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="Leaf Count" type="number" value={newEntry.leaves} onChange={(e) => setNewEntry({ ...newEntry, leaves: e.target.value })} />
                </Grid>
              </Grid>

              <TextField select fullWidth label="Growth Stage" value={newEntry.stage} onChange={(e) => setNewEntry({ ...newEntry, stage: e.target.value })}>
                <MenuItem value="Seedling">Seedling</MenuItem>
                <MenuItem value="Vegetative">Vegetative</MenuItem>
                <MenuItem value="Flowering">Flowering</MenuItem>
                <MenuItem value="Fruiting">Fruiting</MenuItem>
                <MenuItem value="Dormant">Dormant</MenuItem>
              </TextField>

              <TextField fullWidth label="Current Look Image URL" value={newEntry.image} onChange={(e) => setNewEntry({ ...newEntry, image: e.target.value })} placeholder="https://..." />
              <TextField fullWidth label="Notes" multiline rows={3} value={newEntry.notes} onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })} placeholder="New leaf unfurled, looks healthy..." />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ px: 4 }}>
              {saving ? 'Saving...' : 'Save Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* VIEW ENTRY DIALOG */}
      <Dialog open={!!selectedEntry} onClose={() => setSelectedEntry(null)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}>
        {selectedEntry && (
          <>
            <Box component="img" src={selectedEntry.image || selectedPlant.image} alt="Entry" sx={{ width: '100%', height: 300, objectFit: 'cover' }} />
            <DialogContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Chip label={selectedEntry.stage} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
              
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Height</Typography>
                  <Typography variant="h5" fontWeight={600}>{selectedEntry.height || '—'} cm</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Leaves</Typography>
                  <Typography variant="h5" fontWeight={600}>{selectedEntry.leaves || '0'}</Typography>
                </Grid>
              </Grid>

              {selectedEntry.notes && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="body2" fontStyle="italic">"{selectedEntry.notes}"</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedEntry(null)} variant="contained" sx={{ borderRadius: 2 }}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Toast */}
      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}