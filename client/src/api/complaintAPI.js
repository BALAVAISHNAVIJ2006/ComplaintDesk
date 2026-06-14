import axiosInstance from './axios'

// ─── User APIs ────────────────────────────────────────────────────────────────

export const createComplaintAPI = (formData) =>
  axiosInstance.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const getMyComplaintsAPI = (params = {}) =>
  axiosInstance.get('/complaints/my', { params })

export const getComplaintAPI = (id) =>
  axiosInstance.get(`/complaints/${id}`)

export const updateComplaintAPI = (id, formData) =>
  axiosInstance.put(`/complaints/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteComplaintAPI = (id) =>
  axiosInstance.delete(`/complaints/${id}`)

// ─── Admin APIs ───────────────────────────────────────────────────────────────

export const adminGetAllComplaintsAPI = (params = {}) =>
  axiosInstance.get('/complaints/admin/all', { params })

export const adminUpdateStatusAPI = (id, status) =>
  axiosInstance.put(`/complaints/admin/${id}/status`, { status })

export const adminAddRemarkAPI = (id, remark) =>
  axiosInstance.put(`/complaints/admin/${id}/remark`, { remark })