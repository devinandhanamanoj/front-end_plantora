import { useState } from 'react';
import { 
  Box, Typography, Grid, Card, Button, Chip, IconButton, 
  Divider, Tabs, Tab, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, CircularProgress,
  DialogContentText, Select
} from '@mui/material';
import { 
  Add, CheckCircle, Delete, Edit, WaterDrop, LocalFlorist, 
  ContentCut, Close, Spa, BugReport, AutoFixHigh, Warning
} from '@mui/icons-material';
import { useTasks } from '../../context/TaskContext';
import { usePlants } from '../../context/PlantContext';

const taskConfig = {
  Watering: { icon: <WaterDrop />, color: 'info' },
  Fertilizing: { icon: <LocalFlorist />, color: 'success' },
  Pruning: { icon: <ContentCut />, color: 'secondary' },
  Repotting: { icon: <Spa />, color: 'primary' },
  'Leaf Cleaning': { icon: <AutoFixHigh />, color: 'warning' },
  'Pest Inspection': { icon: <BugReport />, color: 'error' },
};

// Helper to compute status (auto overdue detection)
const getComputedStatus = (task) => {
  if (task.status === 'Completed') return 'Completed';
  if (!task.dueDate) return 'Pending';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  if (due < today) return 'Overdue';
  return 'Pending';
};

export default function CareTasks() {
  const { tasks, loading, addTask, deleteTask, updateTask } = useTasks();
  const { plants } = usePlants();
  
  const [tab, setTab] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    plantId: '', type: 'Watering', dueDate: '', dueTime: '', notes: '', status: 'Pending'
  });

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({ plantId: '', type: 'Watering', dueDate: '', dueTime: '', notes: '', status: 'Pending' });
    setOpenModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData(task);
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.plantId || !formData.dueDate) return;
    
    setSaving(true);
    try {
      const plantName = plants.find(p => p.id === formData.plantId)?.name || 'Unknown';
      const payload = { ...formData, plantName };
      if (editingTask) await updateTask(editingTask.id, payload);
      else await addTask(payload);
      setOpenModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (task, newStatus) => {
    await updateTask(task.id, { status: newStatus });
  };

  const handleDelete = async () => {
    await deleteTask(deleteId);
    setDeleteId(null);
  };

  // Stats
  const pendingCount = tasks.filter(t => getComputedStatus(t) === 'Pending').length;
  const overdueCount = tasks.filter(t => getComputedStatus(t) === 'Overdue').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;

  // Filtered tasks based on tab
  const filteredTasks = tasks.filter(t => {
    const computed = getComputedStatus(t);
    if (tab === 1) return computed === 'Pending';
    if (tab === 2) return computed === 'Overdue';
    if (tab === 3) return computed === 'Completed';
    return true;
  }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box data-aos="fade-up">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Care Tasks</Typography>
          <Typography variant="body1" color="text.secondary">Keep your plants thriving.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAddModal} sx={{ borderRadius: 2, px: 3 }}>
          Add Task
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Pending', val: pendingCount, color: 'info.main' }, 
          { label: 'Overdue', val: overdueCount, color: 'error.main' }, 
          { label: 'Completed', val: completedCount, color: 'success.main' }
        ].map((stat, i) => (
          <Grid item xs={12} sm={4} key={i}>
            <Card elevation={0} sx={{ borderRadius: 3, p: 2, textAlign: 'center', borderTop: `4px solid`, borderColor: stat.color }}>
              <Typography variant="h4" fontWeight={700}>{stat.val}</Typography>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab label="All" />
            <Tab label="Pending" />
            <Tab label="Overdue" />
            <Tab label="Completed" />
          </Tabs>
        </Box>
        <Box sx={{ p: 2 }}>
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No tasks found. Add one to get started!</Typography>
            </Box>
          ) : (
            filteredTasks.map((task, i) => {
              const cfg = taskConfig[task.type] || taskConfig.Watering;
              const computedStatus = getComputedStatus(task);
              
              return (
                <Box key={task.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 1, gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <Box sx={{ p: 1, bgcolor: `${cfg.color}.light`, color: `${cfg.color}.main`, borderRadius: 2, display: 'flex' }}>{cfg.icon}</Box>
                    
                    <Box sx={{ flex: 1, minWidth: 150, opacity: computedStatus === 'Completed' ? 0.6 : 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {task.type} - {task.plantName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.dueDate} {task.dueTime && `at ${task.dueTime}`}
                      </Typography>
                    </Box>

                    <Chip 
                      label={computedStatus} 
                      size="small" 
                      color={computedStatus === 'Overdue' ? 'error' : computedStatus === 'Completed' ? 'success' : 'warning'} 
                      variant="outlined"
                      icon={computedStatus === 'Overdue' ? <Warning /> : undefined}
                    />

                    <Select
                      size="small"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      sx={{ minWidth: 130, bgcolor: 'background.default', borderRadius: 2 }}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Completed">Completed</MenuItem>
                    </Select>

                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="info" onClick={() => openEditModal(task)}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteId(task.id)}><Delete fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                  {i < filteredTasks.length - 1 && <Divider />}
                </Box>
              );
            })
          )}
        </Box>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          {editingTask ? 'Edit Task' : 'Add New Task'}
          <IconButton onClick={() => setOpenModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField select fullWidth label="Select Plant" value={formData.plantId} onChange={(e) => setFormData({ ...formData, plantId: e.target.value })} required>
                {plants.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Task Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                {Object.keys(taskConfig).map(key => <MenuItem key={key} value={key}>{key}</MenuItem>)}
              </TextField>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {/* FIXED DATE INPUT */}
                  <TextField 
                    fullWidth 
                    type="date" 
                    label="Due Date" 
                    value={formData.dueDate} 
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    sx={{
                      '& input[type="date"]::-webkit-datetime-edit': { 
                        color: formData.dueDate ? 'inherit' : 'transparent' 
                      },
                      '& input[type="date"]:focus::-webkit-datetime-edit': { 
                        color: 'inherit' 
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* FIXED TIME INPUT */}
                  <TextField 
                    fullWidth 
                    type="time" 
                    label="Due Time" 
                    value={formData.dueTime} 
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })} 
                    InputLabelProps={{ shrink: true }} 
                    sx={{
                      '& input[type="time"]::-webkit-datetime-edit': { 
                        color: formData.dueTime ? 'inherit' : 'transparent' 
                      },
                      '& input[type="time"]:focus::-webkit-datetime-edit': { 
                        color: 'inherit' 
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <TextField fullWidth label="Notes" multiline rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ px: 4 }}>
              {saving ? 'Saving...' : (editingTask ? 'Save Changes' : 'Create Task')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent>
          <DialogContentText>This task will be permanently removed from your list.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}