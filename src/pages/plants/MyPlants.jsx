import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Button, TextField, MenuItem, 
  InputAdornment, Card, CardContent, CardMedia, Chip, 
  IconButton, Stack, Pagination, useTheme, useMediaQuery,
  CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Add, Search, Visibility, Edit, Delete,
  WbSunny, WaterDrop, LocationOn,
  CheckCircle, Warning, Error as ErrorIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';

// Map health status to color + icon
const healthConfig = {
  'Healthy': { color: 'success', icon: <CheckCircle fontSize="small" /> },
  'Needs Attention': { color: 'error', icon: <Warning fontSize="small" /> },
  'Under Observation': { color: 'warning', icon: <ErrorIcon fontSize="small" /> },
};

export default function MyPlants() {
  const { plants, loading, error, deletePlant } = usePlants();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Read from URL

  // Read initial search from URL query (?q=...)
  const initialSearch = searchParams.get('q') || '';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('All');
  const [health, setHealth] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // <-- NEW SORT STATE
  
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Sync search bar with URL changes (e.g., if user searches again from Navbar)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearch(q);
  }, [searchParams]);

  const handleDelete = async () => {
    try {
      await deletePlant(deleteId);
    } catch (err) {
      console.error("Failed to delete", err);
    } finally {
      setDeleteId(null);
      setDeleteName('');
    }
  };

  // Filtering & Sorting Logic
  const filteredPlants = plants
    .filter((plant) => {
      const matchesSearch = plant.name.toLowerCase().includes(search.toLowerCase()) || 
                            (plant.scientific && plant.scientific.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = category === 'All' || plant.category === category;
      const matchesHealth = health === 'All' || plant.health === health;
      return matchesSearch && matchesCategory && matchesHealth;
    })
    .sort((a, b) => {
      // <-- SORTING LOGIC -->
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      // 'newest' (default) assumes items were appended to db.json in order
      return b.id - a.id;
    });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">My Plants</Typography>
          <Typography variant="body1" color="text.secondary">Manage and track your botanical collection ({filteredPlants.length} plants).</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => navigate('/plants/add')} 
          sx={{ px: 3, py: 1, borderRadius: 2 }}
        >
          Add New Plant
        </Button>
      </Box>

      {/* Filter Bar */}
      <Card elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2.5} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth 
              size="small" 
              placeholder="Search by plant name or species..."
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><Search color="action" fontSize="small" /></InputAdornment> 
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField 
              select 
              fullWidth 
              size="small" 
              label="Category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {['All', 'Foliage', 'Succulent', 'Flowering', 'Cactus'].map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <TextField 
              select 
              fullWidth 
              size="small" 
              label="Health Status" 
              value={health} 
              onChange={(e) => setHealth(e.target.value)} 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {['All', 'Healthy', 'Needs Attention', 'Under Observation'].map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>
          </Grid>
          
          {/* WORKING SORT DROPDOWN */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SortIcon fontSize="small" color="action" /></InputAdornment>
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* Grid */}
      {filteredPlants.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No plants found.</Typography>
          <Button variant="text" onClick={() => { setSearch(''); setCategory('All'); setHealth('All'); }} sx={{ mt: 1 }}>
            Clear Filters
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPlants.map((plant, index) => {
            const status = healthConfig[plant.health] || healthConfig['Healthy'];
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id} data-aos="zoom-in-up" data-aos-delay={index * 50}>
                <Card elevation={0} sx={{ 
                  height: '100%', display: 'flex', flexDirection: 'column',
                  borderRadius: 4, border: '1px solid', borderColor: 'divider',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(36,75,56,0.08)' }
                }}>
                  
                  {/* Image + Floating Status Badge */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={plant.image || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800'}
                      alt={plant.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    {/* FLOATING STATUS BADGE */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        bgcolor: 'background.paper',
                        px: 1.2,
                        py: 0.4,
                        borderRadius: 99,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        color: `${status.color}.main`,
                        border: '1px solid',
                        borderColor: `${status.color}.light`,
                      }}
                    >
                      {status.icon}
                      <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem', letterSpacing: 0.3 }}>
                        {plant.health}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={600} noWrap title={plant.name}>{plant.name}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block', mt: 0.5 }} noWrap>
                        {plant.scientific || 'Unknown species'}
                      </Typography>
                    </Box>

                    <Stack spacing={1} sx={{ mb: 3, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }} color="text.secondary">
                        <LocationOn fontSize="small" color="action" /> {plant.location || 'No location'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.secondary">
                          <WbSunny fontSize="small" color="warning" /> {plant.sunlight}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.secondary">
                          <WaterDrop fontSize="small" color="info" /> {plant.water}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px solid', borderColor: 'divider', mt: 'auto' }}>
                      <Chip label={plant.category} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem', height: 24 }} />
                      
                      <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" color="primary" onClick={() => navigate(`/plants/${plant.id}`)} sx={{ bgcolor: 'action.hover' }}><Visibility fontSize="small" /></IconButton>
                        <IconButton size="small" color="info" onClick={() => navigate(`/plants/${plant.id}/edit`)} sx={{ bgcolor: 'action.hover' }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={() => { setDeleteId(plant.id); setDeleteName(plant.name); }} sx={{ bgcolor: 'action.hover' }}><Delete fontSize="small" /></IconButton>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination */}
      {filteredPlants.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
          <Pagination count={1} color="primary" shape="rounded" size={isMobile ? 'small' : 'medium'} />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Plant?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteName}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}