import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen} 
        onMobileClose={() => setMobileOpen(false)} 
      />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Make sure to pass the mobile toggle function to the Navbar */}
        <Navbar onOpenMobileNav={() => setMobileOpen(true)} />
        
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
          <Outlet />
        </Box>
        
        <Box component="footer" sx={{ py: 3, px: 4, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Plantora. Nurture Every Leaf, Grow Every Day.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}