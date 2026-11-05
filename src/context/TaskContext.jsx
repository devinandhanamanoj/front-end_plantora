import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TaskCtx = createContext(null);
export const useTasks = () => useContext(TaskCtx);

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/careTasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const addTask = async (newTask) => {
    const res = await axiosInstance.post('/careTasks', newTask);
    setTasks((prev) => [...prev, res.data]);
    return res.data;
  };

  const updateTask = async (id, updates) => {
  const res = await axiosInstance.patch(`/careTasks/${id}`, updates);
  setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  return res.data;
};

  const deleteTask = async (id) => {
    await axiosInstance.delete(`/careTasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TaskCtx.Provider value={{ tasks, loading, addTask, updateTask, deleteTask }}>
      {children}
    </TaskCtx.Provider>
  );
}