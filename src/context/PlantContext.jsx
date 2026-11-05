import { createContext, useContext, useEffect, useState } from 'react';
import { plantService } from '../services/apiServices';
import axiosInstance from '../api/axiosInstance';

const PlantCtx = createContext(null);
export const usePlants = () => useContext(PlantCtx);

export function PlantProvider({ children }) {
  const [plants, setPlants] = useState([]);
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = async () => {
    setLoading(true);
    try {
      const data = await plantService.getAll();
      setPlants(data);
    } catch (err) {
      console.error("Error fetching plants:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      const res = await axiosInstance.get('/plantLibrary');
      setLibrary(res.data);
    } catch (err) {
      console.error("Error fetching library:", err);
    }
  };

  useEffect(() => {
    fetchPlants();
    fetchLibrary();
  }, []);

  const addPlant = async (newPlant) => {
    const data = await plantService.create(newPlant);
    setPlants((prev) => [...prev, data]);
    return data;
  };

  const updatePlant = async (id, updates) => {
    const data = await plantService.update(id, updates);
    setPlants((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  };

  const deletePlant = async (id) => {
    await plantService.delete(id);
    setPlants((prev) => prev.filter((p) => p.id !== id));
  };

  const getPlantById = async (id) => {
    return await plantService.getById(id);
  };

  // --- ADDED: Function to save a new plant to the Library ---
  const addLibraryPlant = async (newPlant) => {
    const res = await axiosInstance.post('/plantLibrary', newPlant);
    setLibrary((prev) => [...prev, res.data]);
    return res.data;
  };

  return (
    <PlantCtx.Provider value={{ 
      plants, loading, library, 
      addPlant, updatePlant, deletePlant, getPlantById, fetchPlants,
      addLibraryPlant // <-- EXPORTED HERE
    }}>
      {children}
    </PlantCtx.Provider>
  );
}