import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardMedia, Button, TextField,
  InputAdornment, Chip, Stack, MenuItem, CircularProgress, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Search, Add, WbSunny, WaterDrop, Spa, Close, Visibility } from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';

export default function PlantLibrary() {
  const { plants, library, addPlant, addLibraryPlant, loading } = usePlants();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [savingId, setSavingId] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [newPlant, setNewPlant] = useState({
    commonName: '', scientificName: '', category: 'Flowering',
    description: '', sunlight: 'Indirect', watering: 'Weekly',
    difficulty: 'Easy', image: ''
  });

  const filteredLibrary = library.filter((plant) => {
    const matchesSearch = plant.commonName.toLowerCase().includes(search.toLowerCase()) ||
                          plant.scientificName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || plant.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAddToMyPlants = async (libPlant) => {
    const isAlreadyAdded = plants.some(p => p.name.toLowerCase() === libPlant.commonName.toLowerCase());

    if (isAlreadyAdded) {
      setSnack({ open: true, message: `${libPlant.commonName} is already in your collection!`, severity: 'warning' });
      return;
    }

    setSavingId(libPlant.id);
    try {
      const plantToSave = {
        name: libPlant.commonName,
        scientific: libPlant.scientificName,
        category: libPlant.category,
        image: libPlant.image,
        location: 'Not set',
        sunlight: libPlant.sunlight,
        water: libPlant.watering,
        soil: 'Standard potting mix',
        notes: libPlant.description,
        health: 'Healthy',
      };
      await addPlant(plantToSave);
      setSnack({ open: true, message: `${libPlant.commonName} added to My Plants!`, severity: 'success' });
    } catch (err) {
      setSnack({ open: true, message: 'Failed to add plant.', severity: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveToLibrary = async (e) => {
    e.preventDefault();
    if (!newPlant.commonName) return;
    setSavingToLibrary(true);
    try {
      const payload = {
        ...newPlant,
        image: newPlant.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800'
      };
      await addLibraryPlant(payload);
      setSnack({ open: true, message: `${newPlant.commonName} added to the Library!`, severity: 'success' });
      setOpenModal(false);
      setNewPlant({ commonName: '', scientificName: '', category: 'Flowering', description: '', sunlight: 'Indirect', watering: 'Weekly', difficulty: 'Easy', image: '' });
    } catch (err) {
      setSnack({ open: true, message: 'Failed to add plant to library.', severity: 'error' });
    } finally {
      setSavingToLibrary(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Plant Library</Typography>
          <Typography variant="body1" color="text.secondary">
            Discover and manage plants for the future ({filteredLibrary.length} plants).
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)} sx={{ borderRadius: 2, px: 3 }}>
          Add to Library
        </Button>
      </Box>

      {/* Search + Filter */}
      <Card elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth size="small" placeholder="Search by name or species..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search color="action" fontSize="small" /></InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField
              select fullWidth size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {['All', 'Flowering', 'Medicinal', 'Foliage', 'Succulent'].map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Cards Grid — exactly 5 per row on XL, identical size */}
      {filteredLibrary.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary">No plants found matching your search.</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
              xl: 'repeat(5, 1fr)',
            },
            gap: 3,
            alignItems: 'stretch',
          }}
        >
          {filteredLibrary.map((plant) => (
            <Card
              key={plant.id}
              elevation={0}
              sx={{
                height: 380,               // identical height for every card
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(36,75,56,0.08)',
                },
              }}
            >
              {/* Image */}
              <Box sx={{ position: 'relative', height: 180, flexShrink: 0 }}>
                <CardMedia
                  component="img"
                  image={plant.image}
                  alt={plant.commonName}
                  sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
                <Chip
  label={plant.difficulty}
  size="small"
  variant="outlined"
  sx={{
    position: 'absolute', 
    top: 12, 
    right: 12, 
    fontWeight: 700,
    bgcolor: 'background.paper', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    
    // Dynamic color for text and border
    color: plant.difficulty === 'Easy' ? 'success.dark' : plant.difficulty === 'Medium' ? 'warning.dark' : 'error.dark',
    borderColor: plant.difficulty === 'Easy' ? 'success.main' : plant.difficulty === 'Medium' ? 'warning.main' : 'error.main',
    
    // Ensures the text stays colored in dark mode too
    '& .MuiChip-label': {
      color: 'inherit'
    }
  }}

                />
              </Box>

              {/* Content */}
              <CardContent
                sx={{
                  p: 2.5,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Title block — reserved height so titles align across cards */}
                <Box sx={{ mb: 1.5, minHeight: 48 }}>
                  <Typography variant="h6" fontWeight={600} noWrap title={plant.commonName}>
                    {plant.commonName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block" noWrap>
                    {plant.scientificName}
                  </Typography>
                </Box>

                {/* Sunlight / Watering */}
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.secondary">
                    <WbSunny fontSize="small" color="warning" /> {plant.sunlight}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.secondary">
                    <WaterDrop fontSize="small" color="info" /> {plant.watering}
                  </Typography>
                </Stack>

                {/* Bottom Bar pinned to bottom */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 'auto',
                  }}
                >
                  <Chip label={plant.category} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem', height: 24 }} />

                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="primary" onClick={() => navigate(`/library/${plant.id}`)} sx={{ bgcolor: 'action.hover' }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAddToMyPlants(plant)}
                      disabled={savingId === plant.id}
                      sx={{ borderRadius: 2, px: 1.5, fontSize: '0.75rem' }}
                    >
                      {savingId === plant.id ? '...' : 'Add'}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add to Library Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          Add New Plant to Library
          <IconButton onClick={() => setOpenModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSaveToLibrary}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
              <TextField fullWidth label="Common Name" value={newPlant.commonName} onChange={(e) => setNewPlant({ ...newPlant, commonName: e.target.value })} required />
              <TextField fullWidth label="Scientific Name" value={newPlant.scientificName} onChange={(e) => setNewPlant({ ...newPlant, scientificName: e.target.value })} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Category" value={newPlant.category} onChange={(e) => setNewPlant({ ...newPlant, category: e.target.value })}>
                    <MenuItem value="Flowering">Flowering</MenuItem>
                    <MenuItem value="Medicinal">Medicinal</MenuItem>
                    <MenuItem value="Foliage">Foliage</MenuItem>
                    <MenuItem value="Succulent">Succulent</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Difficulty" value={newPlant.difficulty} onChange={(e) => setNewPlant({ ...newPlant, difficulty: e.target.value })}>
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField fullWidth label="Image URL" value={newPlant.image} onChange={(e) => setNewPlant({ ...newPlant, image: e.target.value })} placeholder="https://..." />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Sunlight" value={newPlant.sunlight} onChange={(e) => setNewPlant({ ...newPlant, sunlight: e.target.value })}>
                    <MenuItem value="Full Sun">Full Sun</MenuItem>
                    <MenuItem value="Partial Sun">Partial Sun</MenuItem>
                    <MenuItem value="Indirect">Indirect</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField select fullWidth label="Watering" value={newPlant.watering} onChange={(e) => setNewPlant({ ...newPlant, watering: e.target.value })}>
                    <MenuItem value="Daily">Daily</MenuItem>
                    <MenuItem value="Weekly">Weekly</MenuItem>
                    <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
                    <MenuItem value="Monthly">Monthly</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField fullWidth label="Description" multiline rows={3} value={newPlant.description} onChange={(e) => setNewPlant({ ...newPlant, description: e.target.value })} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={savingToLibrary} sx={{ px: 4 }}>
              {savingToLibrary ? 'Saving...' : 'Save to Library'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Alert Toast */}
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