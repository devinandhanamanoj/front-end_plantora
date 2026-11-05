import { useMemo } from 'react';
import { Box, Typography, Grid, Card, CircularProgress, Alert, Avatar } from '@mui/material';
import { Spa, LocalFlorist, TaskAlt, CheckCircle, TrendingUp, WarningAmber } from '@mui/icons-material';
import { usePlants } from '../../context/PlantContext';
import { useTasks } from '../../context/TaskContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line 
} from 'recharts';

export default function Analytics() {
  const { plants, loading: plantsLoading } = usePlants();
  const { tasks, loading: tasksLoading } = useTasks();

  const stats = useMemo(() => {
    if (plantsLoading || tasksLoading) return null;

    const totalPlants = plants.length;
    const healthyPlants = plants.filter(p => p.health === 'Healthy').length;
    const needsAttention = plants.filter(p => p.health !== 'Healthy').length;
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // 1. Plant Categories
    const plantCategories = plants.reduce((acc, plant) => {
      acc[plant.category] = (acc[plant.category] || 0) + 1;
      return acc;
    }, {});
    const categoryData = Object.entries(plantCategories)
      .map(([label, count]) => ({ label, percent: Math.round((count / totalPlants) * 100), count }))
      .sort((a, b) => b.count - a.count);

    // 2. Task Types
    const taskDistribution = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {});
    const taskData = Object.entries(taskDistribution)
      .map(([label, count]) => ({ label, percent: Math.round((count / totalTasks) * 100), count }))
      .sort((a, b) => b.count - a.count);

    // 3. Task vs Days Line Chart (Last 30 Days)
    const dailyTaskData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const taskCount = tasks.filter(t => t.dueDate === dateStr).length;
      
      dailyTaskData.push({
        date: displayDate,
        tasks: taskCount
      });
    }

    return { 
      totalPlants, healthyPlants, needsAttention, totalTasks, completedTasks, pendingTasks, completionRate, 
      categoryData, taskData, dailyTaskData 
    };
  }, [plants, tasks, plantsLoading, tasksLoading]);

  if (plantsLoading || tasksLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!stats) return <Alert severity="error">Failed to load analytics data.</Alert>;

  const categoryColors = ['#477653', '#A8BE9B', '#244B38', '#E8EFE4', '#788579'];
  const barColors = ['#244B38', '#477653', '#A8BE9B', '#788579', '#E8EFE4'];

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} color="primary.dark">Analytics</Typography>
        <Typography variant="body1" color="text.secondary">Insights into your plant care journey.</Typography>
      </Box>

      {/* Top Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Plants', val: stats.totalPlants, icon: <Spa />, color: 'primary.main' },
          { label: 'Healthy Plants', val: stats.healthyPlants, icon: <LocalFlorist />, color: 'success.main' },
          { label: 'Completion Rate', val: `${stats.completionRate}%`, icon: <CheckCircle />, color: 'info.main' },
          { label: 'Pending Tasks', val: stats.pendingTasks, icon: <WarningAmber />, color: 'warning.main' },
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card elevation={0} sx={{ 
              borderRadius: 4, p: 2.5, 
              display: 'flex', alignItems: 'center', gap: 2, 
              border: '1px solid', borderColor: 'divider',
              width: '100%'
            }}>
              <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 56, height: 56 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h4" fontWeight={700}>{stat.val}</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Grid */}
      <Grid container spacing={3} alignItems="stretch">
        
        {/* ROW 1 */}
        {/* 1. Plant Categories */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, height: '100%', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Plant Categories</Typography>
            {stats.categoryData.length === 0 ? (
              <Typography color="text.secondary">No plants added yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', gap: 2 }}>
                <Box sx={{ width: 160, height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.categoryData} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} stroke="none">
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.categoryData.map((cat, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: categoryColors[i % categoryColors.length] }} />
                        <Typography variant="body2" fontWeight={500}>{cat.label}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">{cat.count} ({cat.percent}%)</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* 2. Care Task Distribution */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Care Task Distribution</Typography>
            {stats.taskData.length === 0 ? (
              <Typography color="text.secondary">No tasks data yet.</Typography>
            ) : (
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.taskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E9DF" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#788579', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#788579', fontSize: 12 }} allowDecimals={false} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {stats.taskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>

        {/* 3. Trends - Styled to match Health Insights perfectly */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Trends</Typography>
            
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600} color="primary.dark">Total Activities</Typography>
                <Typography variant="h4" fontWeight={700} color="primary.dark">{stats.totalTasks}</Typography>
              </Box>
              <Typography variant="caption" color="primary.dark" sx={{ opacity: 0.8 }}>Total tasks ever created.</Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600} color="success.dark">Completed Tasks</Typography>
                <Typography variant="h4" fontWeight={700} color="success.dark">{stats.completedTasks}</Typography>
              </Box>
              <Typography variant="caption" color="success.dark" sx={{ opacity: 0.8 }}>Successfully finished care tasks.</Typography>
            </Box>
          </Card>
        </Grid>

        {/* ROW 2 */}
        {/* 4. Health Insights */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, height: '100%', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Health Insights</Typography>
            
            <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600} color="success.dark">Healthy Plants</Typography>
                <Typography variant="h4" fontWeight={700} color="success.dark">{stats.healthyPlants}</Typography>
              </Box>
              <Typography variant="caption" color="success.dark" sx={{ opacity: 0.8 }}>These plants are thriving perfectly.</Typography>
            </Box>
            
            <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" fontWeight={600} color="warning.dark">Needs Attention</Typography>
                <Typography variant="h4" fontWeight={700} color="warning.dark">{stats.needsAttention}</Typography>
              </Box>
              <Typography variant="caption" color="warning.dark" sx={{ opacity: 0.8 }}>Check symptoms and log health records.</Typography>
            </Box>
          </Card>
        </Grid>

        {/* 5. Line Chart */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6" fontWeight={600}>Care Tasks Activity (Last 30 Days)</Typography>
            </Box>
            <Box sx={{ height: 250, width: '100%' }}>
              {stats.dailyTaskData.length === 0 ? (
                <Typography color="text.secondary">Not enough task data to display.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyTaskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E9DF" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#788579', fontSize: 12 }} minTickGap={30} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#788579', fontSize: 12 }} allowDecimals={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#477653" 
                      strokeWidth={3} 
                      dot={{ r: 4, fill: '#244B38', strokeWidth: 2, stroke: '#FFF' }} 
                      activeDot={{ r: 7 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
}