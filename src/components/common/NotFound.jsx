import { Box, Typography, Button } from '@mui/material';
import { Spa } from '@mui/icons-material'; // <-- Swapped Eco for Spa

export default function NotFound() {
  return (
    <Box 
      sx={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        justifyContent: 'center', minHeight: '60vh', textAlign: 'center', px: 2 
      }}
      data-aos="zoom-in"
    >
      <Spa sx={{ fontSize: 100, color: 'secondary.main', mb: 2, opacity: 0.5 }} /> {/* <-- Updated */}
      <Typography variant="h2" fontWeight={700} color="primary.dark" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        This page has yet to sprout.
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
        We couldn't find the page you're looking for. It might have been moved, or it may not exist yet.
      </Typography>
      <Button variant="contained" href="/" sx={{ borderRadius: 2, px: 4 }}>
        Return to Dashboard
      </Button>
    </Box>
  );
}