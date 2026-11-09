import api from "./api";

export const getComparisonData = async (kodeModul, tahun) =>
  (await api.get(`/modules/${kodeModul}/comparison`, { params: { tahun } })).data;

export const saveDinasValue = async (payload) =>
  (await api.post("/dinas", payload)).data;
