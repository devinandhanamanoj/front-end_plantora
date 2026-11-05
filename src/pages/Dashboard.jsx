import { Box, Typography, Grid, Card, Button, Avatar, Chip, CircularProgress, Alert } from '@mui/material';
import { Add, WaterDrop, LocalFlorist, WarningAmber, CheckCircle, EventNote, PictureAsPdf } from '@mui/icons-material'; // <-- Added PictureAsPdf
import { usePlants } from '../context/PlantContext';
import { useTasks } from '../context/TaskContext';
import { useReports } from '../context/ReportContext'; // <-- Added useReports
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { plants, loading: plantsLoading, error: plantsError } = usePlants();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { reports } = useReports(); // <-- Get reports
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!plants || !tasks) return null;

    const totalPlants = plants.length;
    const healthyPlants = plants.filter(p => p.health === 'Healthy').length;
    const needsAttention = plants.filter(p => p.health !== 'Healthy').length;
    const pendingTasksCount = tasks.filter(t => t.status !== 'Completed').length;

    const recentlyAdded = [...plants].reverse().slice(0, 5);
    
    // <-- Get recent reports
    const recentReports = reports ? reports.slice(0, 5) : [];

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysTasks = tasks.filter(t => t.dueDate === todayStr && t.status !== 'Completed');

    const chartData = [
      { name: 'Pending', value: pendingTasksCount, color: '#477653' },
      { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: '#A8BE9B' },
      { name: 'Overdue', value: tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed').length, color: '#EF4444' }
    ];

    // <-- Return recentReports
    return { totalPlants, healthyPlants, needsAttention, pendingTasksCount, recentlyAdded, todaysTasks, chartData, recentReports };
  }, [plants, tasks, reports]);

  if (plantsLoading || tasksLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (plantsError || tasksError || !stats) return <Alert severity="error">Failed to load dashboard.</Alert>;

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Welcome back, Gardener!</Typography>
          <Typography variant="body1" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/plants/add')} sx={{ borderRadius: 2, px: 3 }}>
          Add Plant
        </Button>
      </Box>

      {/* Stats - Forced to Stretch */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { icon: <LocalFlorist />, label: 'Total Plants', val: stats.totalPlants, color: 'primary.main' },
          { icon: <CheckCircle />, label: 'Healthy Plants', val: stats.healthyPlants, color: 'success.main' },
          { icon: <WaterDrop />, label: 'Pending Tasks', val: stats.pendingTasksCount, color: 'info.main' },
          { icon: <WarningAmber />, label: 'Needs Attention', val: stats.needsAttention, color: 'warning.main' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ 
              borderRadius: 4, p: 3, 
              display: 'flex', alignItems: 'center', gap: 2, 
              border: '1px solid', borderColor: 'divider',
              width: '100%', // Forces full width
              transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' }
            }}>
              <Avatar sx={{ bgcolor: stat.color, width: 56, height: 56 }}>{stat.icon}</Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{stat.label}</Typography>
                <Typography variant="h4" fontWeight={700}>{stat.val}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content - Shifted to 3 Columns (5/4/3) to fit Reports */}
      <Grid container spacing={3} alignItems="stretch">
        
        {/* Left Column - Chart & Tasks */}
        <Grid item xs={12} lg={5} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Chart */}
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Care Task Overview</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              <Box sx={{ width: 180, height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.chartData} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                      {stats.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats.chartData.map((entry) => (
                  <Box key={entry.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color }} />
                      <Typography variant="body2" fontWeight={500}>{entry.name}</Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700}>{entry.value}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>

          {/* Today's Tasks */}
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>Today's Care Tasks</Typography>
              <Button size="small" onClick={() => navigate('/care/tasks')}>View All</Button>
            </Box>
            
            {stats.todaysTasks.length === 0 ? (
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <EventNote sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No tasks scheduled for today. Great job!</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stats.todaysTasks.slice(0, 4).map((task) => (
                  <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>{task.type}</Typography>
                      <Typography variant="caption" color="text.secondary">{task.plantName}</Typography>
                    </Box>
                    <Chip label={task.dueTime || 'Anytime'} size="small" color="info" variant="outlined" />
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Middle Column - Recently Added */}
        <Grid item xs={12} md={6} lg={4}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>Recently Added</Typography>
              <Button size="small" onClick={() => navigate('/plants')}>View All</Button>
            </Box>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {stats.recentlyAdded.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No plants added yet.</Typography>
              ) : (
                stats.recentlyAdded.map((plant) => (
                  <Box key={plant.id} sx={{ 
                    display: 'flex', alignItems: 'center', gap: 2, p: 1.5, 
                    borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    transition: 'background-color 0.2s', '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/plants/${plant.id}`)}
                  >
                    <Avatar src={plant.image} sx={{ width: 56, height: 56, border: '1px solid #E8EFE4' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight={600} noWrap>{plant.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {plant.category} • {plant.location || 'No location'}
                      </Typography>
                    </Box>
                    <Chip 
                      label={plant.health} 
                      size="small" 
                      color={plant.health === 'Healthy' ? 'success' : plant.health === 'Needs Attention' ? 'error' : 'warning'} 
                      sx={{ fontWeight: 600 }} 
                    />
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

        {/* NEW Right Column - Saved Reports */}
        <Grid item xs={12} md={6} lg={3}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>Saved Reports</Typography>
              <Button size="small" onClick={() => navigate('/reports')}>View All</Button>
            </Box>
            
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stats.recentReports.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <PictureAsPdf sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary" align="center">No reports generated yet.</Typography>
                </Box>
              ) : (
                stats.recentReports.map((report) => (
                  <Box key={report.id} sx={{ 
                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, 
                    borderRadius: 2, border: '1px solid', borderColor: 'divider',
                    cursor: 'pointer', transition: 'background-color 0.2s', '&:hover': { bgcolor: 'action.hover' }
                  }}
                  onClick={() => navigate(`/reports/${report.id}`)}
                  >
                    <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 40, height: 40 }}>
                      <PictureAsPdf fontSize="small" />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>{report.plantName}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {new Date(report.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}