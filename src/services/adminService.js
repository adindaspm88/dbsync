import api from "./api";

export const getCurrentUser = async () => (await api.get("/auth/me")).data;
export const getAdminOptions = async () => (await api.get("/admin/options")).data;
export const getAdminUsers = async () => (await api.get("/admin/users")).data;
export const createAdminUser = async (payload) => (await api.post("/admin/users", payload)).data;
export const updateAdminUser = async (id, payload) => (await api.put(`/admin/users/${id}`, payload)).data;
export const setAdminUserActive = async (id, is_active) => (await api.patch(`/admin/users/${id}/active`, { is_active })).data;
export const getMasterRows = async (master) => (await api.get(`/admin/masters/${master}`)).data;
export const createMasterRow = async (master, payload) => (await api.post(`/admin/masters/${master}`, payload)).data;
export const updateMasterRow = async (master, id, payload) => (await api.put(`/admin/masters/${master}/${id}`, payload)).data;
