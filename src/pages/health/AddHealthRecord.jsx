import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

export default function AddHealthRecord() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/health');
  }, [navigate]);

  return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
}