import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Grid, Button, Card, Divider, 
  CircularProgress, Alert, Chip, Stack, Avatar,
  ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import { 
  ArrowBack, PictureAsPdf, Spa, WbSunny, WaterDrop, 
  LocationOn, Terrain, Timeline
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePlants } from '../../context/PlantContext';
import { useGrowth } from '../../context/GrowthContext';
import { useReports } from '../../context/ReportContext';

// Force Light Theme ONLY for the preview card
const previewTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#477653', dark: '#244B38' },
    background: { default: '#F5F4EA', paper: '#FFFFFF' },
    text: { primary: '#26352B', secondary: '#788579' },
    divider: '#E4E9DF',
  },
  typography: { fontFamily: '"Poppins", sans-serif' },
});

export default function PlantReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPlantById } = usePlants();
  const { entries } = useGrowth();
  const { saveReport } = useReports();
  
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const data = await getPlantById(id);
        setPlant(data);
      } catch (err) {
        setError('Plant not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  const plantGrowth = useMemo(() => {
    return entries
      .filter(e => e.plantId === id)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [entries, id]);

  const handleDownload = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFillColor(36, 75, 56);
      doc.rect(0, 0, 210, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("Plantora", 14, 22);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Plant Health & Growth Report", 150, 22);

      doc.setTextColor(38, 53, 43);
      doc.setFontSize(28);
      doc.setFont("helvetica", "bold");
      doc.text(plant.name, 14, 50);
      doc.setFontSize(14);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 133, 121);
      doc.text(plant.scientific || 'Unknown species', 14, 58);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(200, 50, 50);
      doc.text(`Status: ${plant.health}`, 14, 66);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(38, 53, 43);
      doc.text("Notes", 14, 78);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const splitNotes = doc.splitTextToSize(plant.notes || 'No notes provided.', 180);
      doc.text(splitNotes, 14, 84);

      autoTable(doc, {
        startY: 100,
        head: [['Specification', 'Details']],
        body: [
          ['Category', plant.category],
          ['Location', plant.location || 'Not set'],
          ['Sunlight', plant.sunlight],
          ['Watering', plant.water],
          ['Soil', plant.soil || 'Not set'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [71, 118, 83], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 244, 234] },
        styles: { font: 'helvetica', fontSize: 11 },
      });

      const finalY = (doc.lastAutoTable?.finalY || 140) + 15;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(38, 53, 43);
      doc.text("Growth Journal", 14, finalY);

      if (plantGrowth.length === 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text("No growth entries found for this plant yet.", 14, finalY + 8);
      } else {
        autoTable(doc, {
          startY: finalY + 5,
          head: [['Date', 'Stage', 'Height', 'Leaves']],
          body: plantGrowth.map(entry => [
            entry.date,
            entry.stage,
            entry.height ? `${entry.height} cm` : '—',
            entry.leaves || '—'
          ]),
          theme: 'striped',
          headStyles: { fillColor: [168, 190, 155], textColor: [36, 75, 56] },
          styles: { font: 'helvetica', fontSize: 10 },
        });
      }

      const fileName = `${plant.name.replace(/\s+/g, '_')}_Report.pdf`;
      doc.save(fileName);

      const dataUrl = doc.output('dataurlstring');
      saveReport({
        id: Date.now().toString(),
        plantName: plant.name,
        plantImage: plant.image,
        fileName,
        dataUrl,
        date: new Date().toISOString(),
      });
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (error || !plant) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }} data-aos="fade-up">
      
      {/* 
        TOP BAR 
        NOT inside the Light Theme wrapper, so it uses your app's global theme (Dark or Light).
      */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(`/plants/${id}`)} 
          sx={{ 
            borderRadius: 2, 
            // Force green border and text so it's visible on dark background
            color: 'primary.light', 
            borderColor: 'primary.light',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(168, 190, 155, 0.1)' }
          }}
        >
          Back to Plant
        </Button>
        <Button 
          variant="contained" 
          startIcon={<PictureAsPdf />} 
          onClick={handleDownload} 
          sx={{ borderRadius: 2, px: 3 }}
        >
          Download as PDF
        </Button>
      </Box>

      {/* 
        PREVIEW AREA
        Wrapped in Light Theme so the A4 paper looks like a real document.
      */}
      <ThemeProvider theme={previewTheme}>
        <CssBaseline />
        <Box sx={{ 
          bgcolor: '#E5E7EB', 
          p: { xs: 2, md: 5 }, 
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: '794px', 
            aspectRatio: '210 / 297', 
            bgcolor: 'white', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}>
            
            <Box sx={{ bgcolor: '#244B38', color: 'white', p: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" fontWeight={700}>Plantora</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Plant Health & Growth Report</Typography>
              </Box>
              <Spa sx={{ fontSize: 48, opacity: 0.3 }} />
            </Box>

            <Box sx={{ 
              p: { xs: 3, md: 5 }, 
              flex: 1, 
              overflowY: 'auto',
              bgcolor: 'white',
              color: 'text.primary'
            }}>
              <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 4 }}>
                <Avatar src={plant.image} variant="rounded" sx={{ width: 100, height: 100, borderRadius: 3 }} />
                <Box>
                  <Typography variant="h3" fontWeight={700} color="#244B38">{plant.name}</Typography>
                  <Typography variant="h6" color="text.secondary" fontStyle="italic">{plant.scientific}</Typography>
                  <Chip label={plant.health} color={plant.health === 'Healthy' ? 'success' : plant.health === 'Needs Attention' ? 'error' : 'warning'} sx={{ mt: 1, fontWeight: 600 }} />
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight={700} mb={1} color="#26352B">Notes</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
                {plant.notes || 'No notes provided for this plant.'}
              </Typography>

              <Typography variant="h6" fontWeight={700} mb={2} color="#26352B">Plant Specifications</Typography>
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#F5F4EA', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Spa color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Category</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{plant.category}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#F5F4EA', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <LocationOn color="primary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Location</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{plant.location || 'Not set'}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#F5F4EA', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <WbSunny color="warning" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Sunlight</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{plant.sunlight}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#F5F4EA', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <WaterDrop color="info" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Watering</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{plant.water}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 2, bgcolor: '#F5F4EA', borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Terrain color="secondary" />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">Soil</Typography>
                      <Typography variant="subtitle2" fontWeight={600}>{plant.soil || 'Not set'}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" fontWeight={700} mb={2} color="#26352B">Growth Journal</Typography>
              
              {plantGrowth.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F5F4EA', borderRadius: 2 }}>
                  <Timeline sx={{ color: 'text.disabled', mb: 1, fontSize: 32 }} />
                  <Typography variant="body2" color="text.secondary">No growth entries found for this plant yet.</Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {plantGrowth.map((entry) => (
                    <Box key={entry.id} sx={{ p: 2, border: '1px solid #E4E9DF', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>{entry.stage} Stage</Typography>
                        <Typography variant="caption" color="text.secondary">{entry.date}</Typography>
                      </Box>
                      <Stack direction="row" spacing={3}>
                        <Typography variant="body2"><strong>Height:</strong> {entry.height || '—'} cm</Typography>
                        <Typography variant="body2"><strong>Leaves:</strong> {entry.leaves || '—'}</Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  );
}