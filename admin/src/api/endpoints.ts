import client from './client';

export const authApi = {
  login: (data: { username: string; password: string }) => client.post('/auth/login', data),
  profile: () => client.get('/auth/profile'),
  logout: (refreshToken: string) => client.post('/auth/logout', { refreshToken }),
};

export const leadsApi = {
  getAll: (params?: any) => client.get('/leads', { params }),
  getKanban: () => client.get('/leads/kanban'),
  getStats: () => client.get('/leads/stats'),
  getOne: (id: string) => client.get(`/leads/${id}`),
  create: (data: any) => client.post('/leads', data),
  update: (id: string, data: any) => client.patch(`/leads/${id}`, data),
  addNote: (id: string, note: string) => client.post(`/leads/${id}/notes`, { note }),
  delete: (id: string) => client.delete(`/leads/${id}`),
};

export const carsApi = {
  getAll: (params?: any) => client.get('/cars', { params }),
  getOne: (id: string) => client.get(`/cars/${id}`),
  create: (data: any) => client.post('/cars', data),
  update: (id: string, data: any) => client.patch(`/cars/${id}`, data),
  delete: (id: string) => client.delete(`/cars/${id}`),
};

export const smsApi = {
  getTemplates: () => client.get('/sms/templates'),
  createTemplate: (data: any) => client.post('/sms/templates', data),
  updateTemplate: (id: string, data: any) => client.patch(`/sms/templates/${id}`, data),
  deleteTemplate: (id: string) => client.delete(`/sms/templates/${id}`),
  send: (data: { leadId: string; message: string }) => client.post('/sms/send', data),
  getHistory: (leadId?: string) => client.get('/sms/history', { params: { leadId } }),
  getSettings: () => client.get('/sms/settings'),
  toggleSms: (enabled: boolean) => client.post('/sms/settings/toggle', { enabled }),
};

export const groupsApi = {
  getAll: () => client.get('/monitored-groups'),
  create: (data: any) => client.post('/monitored-groups', data),
  update: (id: string, data: any) => client.patch(`/monitored-groups/${id}`, data),
  delete: (id: string) => client.delete(`/monitored-groups/${id}`),
};

export const usersApi = {
  getAll: () => client.get('/users'),
  create: (data: any) => client.post('/users', data),
  update: (id: string, data: any) => client.patch(`/users/${id}`, data),
  delete: (id: string) => client.delete(`/users/${id}`),
};

export const statsApi = {
  getDashboard: () => client.get('/statistics/dashboard'),
  getFunnel: () => client.get('/statistics/funnel'),
  getSms: () => client.get('/statistics/sms'),
  getTrend: (days?: number) => client.get('/statistics/trend', { params: { days } }),
};

export const uploadApi = {
  photos: (files: FormData) => client.post('/upload/photos', files, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  videos: (files: FormData) => client.post('/upload/videos', files, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const callbacksApi = {
  getAll: () => client.get('/callback-requests'),
  markHandled: (id: string) => client.patch(`/callback-requests/${id}/handled`),
};
