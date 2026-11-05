import axiosInstance from '../api/axiosInstance';

// --- PLANT SERVICES ---
export const plantService = {
  getAll: async () => {
    const res = await axiosInstance.get('/plants');
    return res.data;
  },
  getById: async (id) => {
    const res = await axiosInstance.get(`/plants/${id}`);
    return res.data;
  },
  create: async (plantData) => {
    const res = await axiosInstance.post('/plants', plantData);
    return res.data;
  },
  update: async (id, plantData) => {
    const res = await axiosInstance.patch(`/plants/${id}`, plantData);
    return res.data;
  },
  delete: async (id) => {
    await axiosInstance.delete(`/plants/${id}`);
  }
};