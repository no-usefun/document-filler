import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (email, password) =>
  api.post("/auth/register", { email, password });
export const loginApi = (email, password) =>
  api.post("/auth/login", { email, password });

// XML
export const uploadXML = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/xml/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Documents
export const getDocument = (id) => api.get(`/documents/${id}`);
export const listDocuments = () => api.get("/documents/");

// Forms
export const getFormData = (docId, formType) =>
  api.get(`/forms/${docId}/${formType}`);
export const updateFormData = (docId, formType, fields) =>
  api.put("/forms/update", { document_id: docId, form_type: formType, fields });

// PDF — generate and auto-store in DB
export const generatePDF = async (docId, formType) => {
  const res = await api.post(
    "/pdf/generate",
    { document_id: docId, form_type: formType },
    { responseType: "blob" },
  );
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  // Extract filename from content-disposition header if available
  const cd = res.headers["content-disposition"] || "";
  const match = cd.match(/filename="?([^"]+)"?/);
  a.download = match ? match[1] : `${formType}.pdf`;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
};

// PDF History
export const getPDFHistory = () => api.get("/pdf/history");
export const getPDFHistoryForVoucher = (folder) =>
  api.get(`/pdf/history/${folder}`);
export const downloadStoredPDF = (docId, form) =>
  api.get(`/pdf/download/${docId}/${form}`, { responseType: "blob" });

export default api;
