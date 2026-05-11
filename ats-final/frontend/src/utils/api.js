import axiosInstance from './axios';

const API = {
  // Auth
  loginUser: async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    return res.data;
  },
  registerUser: async (data) => {
    const res = await axiosInstance.post('/auth/register', data);
    return res.data;
  },
  
  // Jobs
  getJobs: async (filters = {}) => {
    const res = await axiosInstance.get('/jobs', { params: filters });
    return res.data;
  },
  getJobById: async (id) => {
    const res = await axiosInstance.get(`/jobs/${id}`);
    return res.data;
  },
  
  // Applications
  applyForJob: async (data) => {
    const res = await axiosInstance.post('/applications', data);
    return res.data;
  },
  getMyApplications: async () => {
    const res = await axiosInstance.get('/applications/my');
    return res.data;
  },
  getAllApplications: async (filters = {}) => {
    const res = await axiosInstance.get('/applications', { params: filters });
    return res.data;
  },
  updateApplicationStatus: async (id, status) => {
    const res = await axiosInstance.put(`/applications/${id}/status`, { status });
    return res.data;
  },
  
  // Interviews
  scheduleInterview: async (data) => {
    const res = await axiosInstance.post('/interviews', data);
    return res.data;
  },
  getInterviews: async () => {
    const res = await axiosInstance.get('/interviews');
    return res.data;
  },
  
  // Email
  sendEmail: async (type, data) => {
    // type can be 'shortlist', 'interview', 'rejection', 'custom'
    const res = await axiosInstance.post(`/email/${type}`, data);
    return res.data;
  },
  
  // File Upload
  uploadFile: async (file, type) => {
    // type can be 'resume' or 'profile'
    const formData = new FormData();
    const fieldName = type === 'profile' ? 'profilePic' : 'resume';
    formData.append(fieldName, file);
    
    const res = await axiosInstance.post(`/upload/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

export default API;
