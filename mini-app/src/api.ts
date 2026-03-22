import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

export const getCars = (params?: any) => api.get('/cars/catalog', { params });
export const getCar = (id: string) => api.get(`/cars/${id}`);
export const createCallback = (data: { phone: string; name?: string; carId?: string; message?: string }) =>
  api.post('/callback-requests', data);

export default api;
