import api from './api';

// Get user's certificates
export const getUserCertificates = async () => {
  const response = await api.get('/api/real-certification');
  return response.data;
};

// Get certificate by ID
export const getCertificateById = async (id) => {
  const response = await api.get(`/api/real-certification/${id}`);
  return response.data;
};

// Verify certificate
export const verifyCertificate = async (certificateId) => {
  const response = await api.post(`/api/real-certification/${certificateId}/verify`);
  return response.data;
};
