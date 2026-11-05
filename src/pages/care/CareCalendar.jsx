import { useState } from 'react';
import { 
  Box, Typography, Grid, Card, IconButton, Button, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Divider, CircularProgress,
  Chip, Select, Tooltip
} from '@mui/material';
import { 
  ChevronLeft, ChevronRight, Add, Close, EventNote, Today 
} from '@mui/icons-material';
import { useTasks } from '../../context/TaskContext';
import { usePlants } from '../../context/PlantContext';

// Helper to compute status
const getComputedStatus = (task) => {
  if (task.status === 'Completed') return 'Completed';
  if (!task.dueDate) return 'Pending';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate);
  if (due < today) return 'Overdue';
  return 'Pending';
};

// Theme colors based on status
const statusConfig = {
  Pending: { bg: 'info.light', text: 'info.dark', color: 'info.main' },
  Overdue: { bg: 'error.light', text: 'error.dark', color: 'error.main' },
  Completed: { bg: 'success.light', text: 'success.dark', color: 'success.main' },
};

export default function CareCalendar() {
  const { tasks, loading, addTask, updateTask } = useTasks();
  const { plants } = usePlants();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    plantId: '', type: 'Watering', dueDate: '', dueTime: '', notes: '', status: 'Pending'
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const formatDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateStr = formatDate(selectedDate);
  const tasksForSelectedDay = tasks.filter(t => t.dueDate === selectedDateStr);
  const todayStr = formatDate(new Date());

  const openAddModal = (dateString) => {
    setFormData({ plantId: '', type: 'Watering', dueDate: dateString || selectedDateStr, dueTime: '', notes: '', status: 'Pending' });
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.plantId || !formData.dueDate) return;
    setSaving(true);
    try {
      const plantName = plants.find(p => p.id === formData.plantId)?.name || 'Unknown';
      await addTask({ ...formData, plantName });
      setOpenModal(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (task, newStatus) => {
    await updateTask(task.id, { status: newStatus });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

  return (
    <Box data-aos="fade-up">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={600} color="primary.dark">Care Calendar</Typography>
          <Typography variant="body1" color="text.secondary">Schedule and track your plant care.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => openAddModal()} sx={{ borderRadius: 2, px: 3 }}>
          Add Task
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Calendar Area */}
        <Grid item xs={12} lg={9}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            
            {/* Calendar Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" fontWeight={600} sx={{ minWidth: 150 }}>
                  {monthName} {year}
                </Typography>
                <Button size="small" variant="outlined" onClick={goToToday} sx={{ borderRadius: 2 }}>
                  Today
                </Button>
              </Box>
              <Box>
                <IconButton onClick={prevMonth} sx={{ bgcolor: 'action.hover', mr: 1 }}><ChevronLeft /></IconButton>
                <IconButton onClick={nextMonth} sx={{ bgcolor: 'action.hover' }}><ChevronRight /></IconButton>
              </Box>
            </Box>

            {/* Days of Week Header */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              bgcolor: 'background.default', 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              py: 1.5
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <Box key={day} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" fontWeight={700} color={i === 0 || i === 6 ? 'error.main' : 'text.secondary'}>
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Calendar Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gridAutoRows: '120px', 
              bgcolor: 'background.paper'
            }}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <Box key={`empty-${i}`} sx={{ borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', opacity: 0.2 }} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(new Date(year, month, day));
                const dayTasks = tasks.filter(t => t.dueDate === dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDateStr;

                return (
                  <Box 
                    key={day}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    sx={{ 
                      borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider',
                      p: 1, position: 'relative', overflow: 'hidden',
                      bgcolor: isSelected ? 'secondary.light' : isToday ? 'action.hover' : 'background.paper',
                      cursor: 'pointer', transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: isSelected ? 'secondary.main' : 'action.hover' }
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      fontWeight={isToday || isSelected ? 700 : 500} 
                      sx={{ 
                        position: 'absolute', top: 8, right: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: '50%',
                        bgcolor: isToday ? 'primary.main' : 'transparent',
                        color: isToday ? 'white' : isSelected ? 'primary.dark' : 'text.primary',
                      }}
                    >
                      {day}
                    </Typography>

                    <Box sx={{ mt: 3.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {dayTasks.slice(0, 2).map(task => {
                        const status = getComputedStatus(task);
                        const conf = statusConfig[status];
                        return (
                          <Tooltip key={task.id} title={`${task.type} - ${task.plantName}`} arrow>
                            <Box sx={{ 
                              p: 0.5, px: 0.75, borderRadius: 1, fontSize: '0.65rem', fontWeight: 600,
                              bgcolor: conf.bg, color: conf.text,
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              opacity: status === 'Completed' ? 0.6 : 1,
                              borderLeft: `3px solid`, borderColor: conf.color
                            }}>
                              {task.type}
                            </Box>
                          </Tooltip>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', pl: 0.5 }}>
                          +{dayTasks.length - 2} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Side Panel */}
        <Grid item xs={12} lg={3}>
          <Card elevation={0} sx={{ borderRadius: 4, p: 3, height: '100%', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={600} mb={0.5}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
            
            <Chip 
              label={`${tasksForSelectedDay.length} ${tasksForSelectedDay.length === 1 ? 'Task' : 'Tasks'}`} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ alignSelf: 'flex-start', mb: 2 }}
            />
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
              {tasksForSelectedDay.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, opacity: 0.6 }}>
                  <EventNote sx={{ fontSize: 48, color: 'action.disabled', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No tasks scheduled for this day.</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {tasksForSelectedDay.map(task => {
                    const status = getComputedStatus(task);
                    const conf = statusConfig[status];
                    return (
                      <Box key={task.id} sx={{ p: 1.5, bgcolor: conf.bg, borderRadius: 2, borderLeft: `4px solid`, borderColor: conf.color }}>
                        <Typography variant="subtitle2" fontWeight={600} color={conf.text}>
                          {task.type} - {task.plantName}
                        </Typography>
                        <Typography variant="caption" color={conf.text} display="block" mb={1.5} sx={{ opacity: 0.8 }}>
                          {task.dueTime || 'Anytime'} • {status}
                        </Typography>
                        
                        <Select
                          size="small"
                          fullWidth
                          value={task.status}
                          onChange={(e) => handleStatusChange(task, e.target.value)}
                          sx={{ bgcolor: 'background.paper', fontSize: 12, height: 32 }}
                        >
                          <MenuItem value="Pending" sx={{ fontSize: 12 }}>Pending</MenuItem>
                          <MenuItem value="Completed" sx={{ fontSize: 12 }}>Completed</MenuItem>
                        </Select>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>

            <Button variant="outlined" fullWidth startIcon={<Add />} onClick={() => openAddModal(selectedDateStr)} sx={{ borderRadius: 2, mt: 'auto' }}>
              Add Task
            </Button>
          </Card>
        </Grid>
      </Grid>

      {/* Add Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
          Schedule New Task
          <IconButton onClick={() => setOpenModal(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <form onSubmit={handleSave}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <TextField select fullWidth label="Select Plant" value={formData.plantId} onChange={(e) => setFormData({ ...formData, plantId: e.target.value })} required>
                {plants.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Task Type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required>
                <MenuItem value="Watering">Watering</MenuItem>
                <MenuItem value="Fertilizing">Fertilizing</MenuItem>
                <MenuItem value="Pruning">Pruning</MenuItem>
                <MenuItem value="Repotting">Repotting</MenuItem>
                <MenuItem value="Leaf Cleaning">Leaf Cleaning</MenuItem>
                <MenuItem value="Pest Inspection">Pest Inspection</MenuItem>
              </TextField>
              <Grid container spacing={2}>
                {/* FIXED DATE INPUT */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    type="date" 
                    label="Due Date" 
                    value={formData.dueDate} 
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} 
                    InputLabelProps={{ shrink: true }} 
                    required 
                    sx={{
                      '& input[type="date"]::-webkit-datetime-edit': { color: formData.dueDate ? 'inherit' : 'transparent' },
                      '& input[type="date"]:focus::-webkit-datetime-edit': { color: 'inherit' }
                    }}
                  />
                </Grid>
                {/* FIXED TIME INPUT */}
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    type="time" 
                    label="Due Time" 
                    value={formData.dueTime} 
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })} 
                    InputLabelProps={{ shrink: true }} 
                    sx={{
                      '& .MuiInputLabel-root': { bgcolor: 'background.paper', px: 0.5 },
                      '& input[type="time"]::-webkit-datetime-edit': { color: formData.dueTime ? 'inherit' : 'transparent' },
                      '& input[type="time"]:focus::-webkit-datetime-edit': { color: 'inherit' }
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
              {saving ? 'Saving...' : 'Schedule Task'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}