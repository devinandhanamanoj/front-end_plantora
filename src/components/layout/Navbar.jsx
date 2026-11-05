import { useState, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  AppBar, Toolbar, IconButton, Box, InputBase, 
  Badge, Tooltip, Menu, MenuItem, Typography, Divider, 
  ListItemIcon, ListItemText, Avatar, Chip
} from '@mui/material';
import { 
  Search, NotificationsNone, DarkModeOutlined, LightModeOutlined, 
  Menu as MenuIcon, WaterDrop, LocalFlorist, ContentCut, 
  Spa, BugReport, AutoFixHigh, Warning
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import { useTasks } from '../../context/TaskContext';
import { usePlants } from '../../context/PlantContext';

const taskIcons = {
  Watering: <WaterDrop fontSize="small" color="info" />,
  Fertilizing: <LocalFlorist fontSize="small" color="success" />,
  Pruning: <ContentCut fontSize="small" color="secondary" />,
  Repotting: <Spa fontSize="small" color="primary" />,
  'Leaf Cleaning': <AutoFixHigh fontSize="small" color="warning" />,
  'Pest Inspection': <BugReport fontSize="small" color="error" />,
};

export default function Navbar({ onOpenMobileNav }) {
  const { mode, toggleMode } = useThemeMode();
  const { tasks } = useTasks();
  const { plants } = usePlants();
  const navigate = useNavigate();

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- NOTIFICATION STATE ---
  const [notifAnchor, setNotifAnchor] = useState(null);
  const openNotif = Boolean(notifAnchor);

  // --- REAL-TIME NOTIFICATIONS ---
  // Get tasks that are pending or overdue, and sort by due date
  const notifications = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'Completed')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [tasks]);

  // --- SEARCH LOGIC ---
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to plants page with search query as a URL param
      navigate(`/plants?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear after search
    }
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      color="transparent" 
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Toolbar sx={{ gap: 2, px: { xs: 2, md: 3 } }}>
        {/* Mobile Menu Button */}
        <IconButton 
          sx={{ display: { xs: 'inline-flex', md: 'none' } }} 
          onClick={onOpenMobileNav}
          color="primary"
        >
          <MenuIcon />
        </IconButton>

        {/* WORKING SEARCH BAR */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'action.hover',
            px: 2,
            py: 0.75,
            borderRadius: 99,
            flex: 1,
            maxWidth: 400,
            transition: 'background-color 0.2s',
            '&:focus-within': {
              bgcolor: 'background.paper',
              boxShadow: '0 0 0 2px #A8BE9B',
            }
          }}
        >
          <Search fontSize="small" color="action" />
          <InputBase 
            placeholder="Search plants and press Enter..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            sx={{ flex: 1, fontSize: 14, color: 'text.primary' }} 
          />
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Right Side: Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          
          {/* Dark Mode Toggle */}
          <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            <IconButton onClick={toggleMode} sx={{ color: 'text.secondary' }}>
              {mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
            </IconButton>
          </Tooltip>

          {/* WORKING NOTIFICATIONS DROPDOWN */}
          <Tooltip title="Task Notifications">
            <IconButton 
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ color: 'text.secondary' }}
            >
              <Badge badgeContent={notifications.length} color="error" max={99}>
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notifAnchor}
            open={openNotif}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{ 
              sx: { 
                width: 320, 
                maxHeight: 400, 
                borderRadius: 3, 
                mt: 1.5,
                boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
              } 
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={700}>Pending Tasks</Typography>
              <Chip label={notifications.length} size="small" color="error" />
            </Box>
            
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">You're all caught up! 🎉</Typography>
                </Box>
              ) : (
                notifications.map((task) => {
                  const plant = plants.find(p => p.id === task.plantId);
                  const isOverdue = new Date(task.dueDate) < new Date().setHours(0,0,0,0);
                  
                  return (
                    <MenuItem 
                      key={task.id} 
                      onClick={() => { setNotifAnchor(null); navigate('/care/tasks'); }}
                      sx={{ py: 1.5, px: 2, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      <ListItemIcon>
                        {taskIcons[task.type] || <LocalFlorist fontSize="small" />}
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${task.type} - ${plant?.name || 'Unknown'}`}
                        secondary={isOverdue ? `Overdue: ${task.dueDate}` : `Due: ${task.dueDate}`}
                        primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                        secondaryTypographyProps={{ 
                          variant: 'caption', 
                          color: isOverdue ? 'error.main' : 'text.secondary',
                          sx: { display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }
                        }}
                      />
                      {isOverdue && <Warning fontSize="small" color="error" />}
                    </MenuItem>
                  );
                })
              )}
            </Box>
            
            <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <MenuItem 
                onClick={() => { setNotifAnchor(null); navigate('/care/tasks'); }}
                sx={{ justifyContent: 'center', borderRadius: 2 }}
              >
                <Typography variant="body2" color="primary.main" fontWeight={600}>View All Tasks</Typography>
              </MenuItem>
            </Box>
          </Menu>

        </Box>
      </Toolbar>
    </AppBar>
  );
}