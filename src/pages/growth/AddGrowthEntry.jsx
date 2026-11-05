import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

export default function AddGrowthEntry() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to journal since the add form is now inline
    navigate('/growth');
  }, [navigate]);

  return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
}