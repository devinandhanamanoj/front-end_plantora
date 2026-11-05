import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Button, CircularProgress, Alert, IconButton, Tooltip 
} from '@mui/material';
import { ArrowBack, Download, PictureAsPdf } from '@mui/icons-material';
import { useReports } from '../../context/ReportContext';

export default function ReportViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports } = useReports();
  
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = reports.find(r => r.id === id);
    if (found) {
      setReport(found);
    }
    setLoading(false);
  }, [reports, id]);

  const handleDownload = () => {
    if (!report) return;
    const link = document.createElement('a');
    link.href = report.dataUrl;
    link.download = report.fileName;
    link.click();
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (!report) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" action={<Button color="inherit" onClick={() => navigate('/reports')}>Go Back</Button>}>
          Report not found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', mx: { xs: -2, md: -4 }, mt: { xs: -2, md: -4} }}>
      
      {/* 
        SLEEK TOP BAR
        Replaced the standard AppBar with a custom dark bar that blends with the PDF viewer 
      */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        px: 3,
        py: 1.5, 
        bgcolor: '#1E1E1E', // Dark theme background
        color: 'white',
        borderBottom: '1px solid #333'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to Reports">
            <IconButton onClick={() => navigate('/reports')} sx={{ color: 'white' }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PictureAsPdf sx={{ color: '#ef4444' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                {report.plantName} - Report
              </Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>
                {report.fileName}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<Download />} 
          onClick={handleDownload}
          sx={{ 
            borderRadius: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Download PDF
        </Button>
      </Box>

      {/* 
        FULL-PAGE PDF VIEWER 
        The magic happens here: `#toolbar=0&navpanes=0` hides the grey browser toolbar.
      */}
      <Box sx={{ flex: 1, bgcolor: '#2C2C2C' }}>
        <iframe 
          src={`${report.dataUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} 
          width="100%" 
          height="100%" 
          style={{ border: 'none' }}
          title="PDF Viewer"
        />
      </Box>
    </Box>
  );
}