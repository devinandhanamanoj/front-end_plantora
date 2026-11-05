import { 
  Box, Typography, Card, Switch, Divider, Button, Select, 
  MenuItem, Grid, Snackbar, Alert, Avatar, Stack, Chip 
} from '@mui/material';
import { 
  DarkMode, NotificationsActive, Straighten, Spa, CheckCircle // <-- Changed Eco to Spa
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';
import { useSettings } from '../../context/SettingsContext';
import { useState } from 'react';

export default function Settings() {
  const { mode, toggleMode } = useThemeMode();
  const { 
    unit, setUnit, 
    timeFormat, setTimeFormat, 
    notifications, setNotifications, 
    animations, setAnimations 
  } = useSettings();

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = () => {
    setSnack({ open: true, message: 'Preferences saved successfully!', severity: 'success' });
  };

  const handleReset = () => {
    setUnit('metric');
    setTimeFormat('12h');
    setAnimations(true);
    setNotifications({ taskReminders: true, healthAlerts: true });
    setSnack({ open: true, message: 'Preferences reset to default.', severity: 'info' });
  };

  return (
    <Box data-aos="fade-up" sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} color="primary.dark">Settings</Typography>
        <Typography variant="body1" color="text.secondary">Manage your Plantora preferences.</Typography>
      </Box>

      <Grid container spacing={3}>
        
        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'primary.dark' }}><DarkMode /></Avatar>
                <Typography variant="h6" fontWeight={600}>Appearance</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Dark Mode</Typography>
                  <Typography variant="caption" color="text.secondary">Switch between light and dark themes.</Typography>
                </Box>
                <Switch checked={mode === 'dark'} onChange={toggleMode} color="primary" />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Animations</Typography>
                  <Typography variant="caption" color="text.secondary">Enable transition effects.</Typography>
                </Box>
                <Switch checked={animations} onChange={(e) => setAnimations(e.target.checked)} color="primary" />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.dark' }}><NotificationsActive /></Avatar>
                <Typography variant="h6" fontWeight={600}>Notifications</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Care Reminders</Typography>
                  <Typography variant="caption" color="text.secondary">Get alerts for watering and fertilizing.</Typography>
                </Box>
                <Switch 
                  checked={notifications.taskReminders} 
                  onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })} 
                  color="primary" 
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600}>Health Alerts</Typography>
                  <Typography variant="caption" color="text.secondary">Notify when a plant needs attention.</Typography>
                </Box>
                <Switch 
                  checked={notifications.healthAlerts} 
                  onChange={(e) => setNotifications({ ...notifications, healthAlerts: e.target.checked })} 
                  color="primary" 
                />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.dark' }}><Straighten /></Avatar>
                <Typography variant="h6" fontWeight={600}>Display & Preferences</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" mb={1} fontWeight={500}>Measurement Unit</Typography>
                  <Select fullWidth size="small" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <MenuItem value="metric">Metric (cm, ml, °C)</MenuItem>
                    <MenuItem value="imperial">Imperial (in, oz, °F)</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" mb={1} fontWeight={500}>Time Format</Typography>
                  <Select fullWidth size="small" value={timeFormat} onChange={(e) => setTimeFormat(e.target.value)}>
                    <MenuItem value="12h">12-hour (AM/PM)</MenuItem>
                    <MenuItem value="24h">24-hour</MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* About */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ borderRadius: 4, bgcolor: 'primary.main', color: 'white' }}>
            <Box sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, textAlign: { xs: 'center', sm: 'left' } }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'secondary.main', color: 'primary.dark' }}>
                <Spa sx={{ fontSize: 40 }} /> {/* <-- Updated here */}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>Plantora</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8, mb: 1.5 }}>
                  Nurture Every Leaf, Grow Every Day.
                </Typography>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                  <Chip label="Version 1.0.0" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} />
                  <Chip icon={<CheckCircle sx={{ color: 'white !important' }} />} label="All Systems Operational" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} />
                </Stack>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button variant="outlined" color="inherit" onClick={handleReset} sx={{ borderRadius: 2, px: 3 }}>Reset</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, px: 4 }}>Save Preferences</Button>
        </Grid>
      </Grid>

      <Snackbar 
        open={snack.open} 
        autoHideDuration={3000} 
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snack.severity} sx={{ borderRadius: 2 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}