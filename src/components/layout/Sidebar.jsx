import { NavLink } from 'react-router-dom';
import { 
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, 
  IconButton, Box, Typography, Divider, useMediaQuery, useTheme 
} from '@mui/material';
import { 
  Dashboard, Spa, EventNote, CalendarMonth, LocalFlorist, 
  Timeline, HealthAndSafety, Insights, Settings, MenuOpen, ChevronLeft,
  PictureAsPdf // <-- ADDED
} from '@mui/icons-material';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: <Dashboard />, end: true },
  { to: '/plants', label: 'My Plants', icon: <Spa /> },
  { to: '/care/tasks', label: 'Care Tasks', icon: <EventNote /> },
  { to: '/care/calendar', label: 'Care Calendar', icon: <CalendarMonth /> },
  { to: '/library', label: 'Plant Library', icon: <LocalFlorist /> },
  { to: '/growth', label: 'Growth Journal', icon: <Timeline /> },
  { to: '/health', label: 'Plant Health', icon: <HealthAndSafety /> },
  { to: '/analytics', label: 'Analytics', icon: <Insights /> },
  { to: '/reports', label: 'My Reports', icon: <PictureAsPdf /> }, // <-- ADDED
  { to: '/settings', label: 'Settings', icon: <Settings /> },
];

export const DRAWER_WIDTH = 260;

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const width = collapsed ? 80 : DRAWER_WIDTH;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Toolbar sx={{ justifyContent: collapsed ? 'center' : 'space-between', px: 2, minHeight: '64px !important' }}>
        {!collapsed && (
          <Typography variant="h6" fontWeight={700} color="primary.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Spa color="primary" /> Plantora
          </Typography>
        )}
        {!isMobile && (
          <IconButton onClick={onToggle} size="small" sx={{ bgcolor: 'action.hover' }}>
            {collapsed ? <MenuOpen fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        )}
      </Toolbar>
      
      <Divider />

      {/* Navigation List */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItemButton
            key={item.to} 
            component={NavLink} 
            to={item.to} 
            end={item.end} 
            onClick={isMobile ? onMobileClose : undefined}
            sx={{
              borderRadius: 2, 
              mb: 0.5, 
              justifyContent: collapsed ? 'center' : 'flex-start',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&.active': { 
                bgcolor: 'secondary.light', 
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': { 
                  color: 'primary.dark', 
                  fontWeight: 600 
                } 
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, justifyContent: 'center', color: 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} 
              />
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Drawer 
        variant="permanent" 
        open 
        sx={{ 
          display: { xs: 'none', md: 'block' }, 
          width, 
          flexShrink: 0, 
          '& .MuiDrawer-paper': { 
            width, 
            boxSizing: 'border-box', 
            borderRight: '1px solid', 
            borderColor: 'divider', 
            bgcolor: 'background.paper', 
            transition: 'width 0.25s ease-in-out',
            overflowX: 'hidden'
          } 
        }}
      >
        {content}
      </Drawer>

      {/* Mobile Drawer */}
      <Drawer 
        variant="temporary" 
        open={mobileOpen} 
        onClose={onMobileClose} 
        ModalProps={{ keepMounted: true }} 
        sx={{ 
          display: { xs: 'block', md: 'none' }, 
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, bgcolor: 'background.paper' } 
        }}
      >
        {content}
      </Drawer>
    </>
  );
}