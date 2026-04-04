import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});

export const predictEmotion = async ({ faceFile, audioFile, text, saveSession = true }) => {
  const formData = new FormData();
  if (faceFile) formData.append("face", faceFile);
  if (audioFile) formData.append("audio", audioFile);
  if (text?.trim()) formData.append("text", text.trim());
  formData.append("save_session", String(saveSession));

  const { data } = await api.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const fetchHistory = async () => (await api.get("/history")).data;
export const fetchHistoryDetail = async (sessionId) => (await api.get(`/history/${sessionId}`)).data;
export const fetchSettings = async () => (await api.get("/settings")).data;
export const updateSettings = async (payload) => (await api.post("/settings", payload)).data;
export const login = async (payload) => (await api.post("/login", payload)).data;
export const logout = async () => (await api.post("/logout")).data;

export default api;
