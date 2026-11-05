import { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, Button, 
  IconButton, Stack, Dialog, DialogTitle, DialogContent, 
  DialogActions, Tooltip, Chip, Divider
} from '@mui/material';
import { 
  PictureAsPdf, Delete, Download, Spa, EventNote, Visibility, MoreVert 
} from '@mui/icons-material';
import { useReports } from '../../context/ReportContext';
import { useNavigate } from 'react-router-dom';

export default function MyReports() {
  const { reports, deleteReport } = useReports();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);

  const handleRedownload = (report) => {
    const link = document.createElement('a');
    link.href = report.dataUrl;
    link.download = report.fileName;
    link.click();
  };

  const handleDelete = () => {
    deleteReport(deleteId);
    setDeleteId(null);
  };

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} color="primary.dark">My Reports</Typography>
        <Typography variant="body1" color="text.secondary">
          All your generated plant reports ({reports.length} total).
        </Typography>
      </Box>

      {reports.length === 0 ? (
        <Card elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4 }}>
          <PictureAsPdf sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>No reports generated yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Generate a report from any plant's details page.
          </Typography>
          <Button variant="contained" startIcon={<EventNote />} onClick={() => navigate('/plants')} sx={{ borderRadius: 2 }}>
            Go to My Plants
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={report.id}>
              <Card elevation={0} sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 4, 
                border: '1px solid', 
                borderColor: 'divider',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: '0 12px 24px rgba(36,75,56,0.12)' 
                }
              }}>
                
                {/* Thumbnail Header */}
                <Box sx={{ position: 'relative', height: 160, bgcolor: 'secondary.light', overflow: 'hidden' }}>
                  {report.plantImage ? (
                    <CardMedia
                      component="img"
                      image={report.plantImage}
                      alt={report.plantName}
                      sx={{ 
                        height: '100%', 
                        width: '100%', 
                        objectFit: 'cover',
                        opacity: 0.8,
                        transition: 'transform 0.3s ease',
                        '&:hover': { transform: 'scale(1.05)' }
                      }}
                    />
                  ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Spa sx={{ fontSize: 60, color: 'primary.main', opacity: 0.4 }} />
                    </Box>
                  )}
                  
                  {/* PDF Badge */}
                  <Box sx={{
                    position: 'absolute', top: 12, right: 12,
                    bgcolor: 'rgba(239, 68, 68, 0.9)', color: 'white',
                    px: 1.5, py: 0.5, borderRadius: 1.5,
                    display: 'flex', alignItems: 'center', gap: 0.5,
                    fontSize: '0.7rem', fontWeight: 700,
                    backdropFilter: 'blur(4px)'
                  }}>
                    <PictureAsPdf sx={{ fontSize: 14 }} /> PDF
                  </Box>
                </Box>

                {/* Card Body */}
                <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight={600} noWrap title={report.plantName} sx={{ mb: 0.5 }}>
                    {report.plantName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {new Date(report.date).toLocaleDateString('en-US', { 
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      size="small" 
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => navigate(`/reports/${report.id}`)}
                      sx={{ borderRadius: 2, boxShadow: 'none' }}
                    >
                      View
                    </Button>
                    <Tooltip title="Download Again">
                      <IconButton 
                        size="small" 
                        onClick={() => handleRedownload(report)}
                        sx={{ bgcolor: 'action.hover', borderRadius: 2 }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Report">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => setDeleteId(report.id)}
                        sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={600}>Delete Report?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete this report from your gallery? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" sx={{ borderRadius: 2 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}