// api.js
import Constants from "expo-constants";
import axios from "axios";

// Read API_BASE_URL from app.json’s extra field
// Supports both classic and EAS configs:
const expoConfig = Constants.manifest ?? Constants.expoConfig;
export const API_BASE_URL = expoConfig.extra.API_BASE_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 12000,
});

// —————————————— AUTH HELPERS ——————————————

/**
 * Call your AuthController.login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 */
export async function loginUser(email, password) {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
}

/**
 * Call your AuthController.register
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ message: string }>}
 */
export async function registerUser(email, password) {
  const response = await api.post("/auth/register", {
    email,
    password,
  });
  return response.data;
}

/**
 * Call your AuthController.refresh
 * @param {string} token       // the expired access token
 * @param {string} refreshToken
 * @returns {Promise<{ token: string, refreshToken: string, user: object }>}
 */
export async function refreshToken(oldToken, refreshToken) {
  const response = await api.post("/Auth/refresh", {
    token: oldToken,
    refreshToken,
  });
  return response.data;
}

// ————————————— EXISTING EXPORTS —————————————

export const fetchProducts = async () => {
  const response = await api.get("/products");
  return response.data.map((p) => ({
    id: p.id,
    title: p.name,
    subtitle: p.description,
    price: typeof p.price === "number" ? `${p.price.toFixed(2)} €` : "–",
    imageUrls: p.imageUrls || [],
  }));
};

export const fetchAllSpareParts = async () => {
  const response = await api.get("/spareparts");
  return response.data.map((sp) => ({
    id: sp.id,
    title: sp.name,
    subtitle: sp.description,
    price: `${sp.price.toFixed(2)} €`,
    imageUrls: sp.imageUrls || [],
  }));
};

export const fetchSpareParts = async (productId) => {
  const response = await api.get(`/products/${productId}/spareparts`);
  return response.data.map((sp) => ({
    id: sp.id,
    title: sp.name,
    subtitle: sp.description,
    price: `${sp.price.toFixed(2)} €`,
    imageUrls: sp.imageUrls || [],
  }));
};

export const fetchAssociatedProducts = async (sparePartId) => {
  const response = await api.get(`/spareparts/${sparePartId}/products`);
  return response.data.map((p) => ({
    id: p.id,
    title: p.name,
    subtitle: p.description,
    price: `${p.price.toFixed(2)} €`,
    imageUrls: p.imageUrls || [],
  }));
};

export async function uploadImage(fileUri, token) {
  const formData = new FormData();
  const filename = fileUri.split("/").pop();
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("file", { uri: fileUri, name: filename, type });

  const resp = await api.post("/Images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return resp.data.url;
}

export async function uploadImages(fileUris, token) {
  return Promise.all(fileUris.map((uri) => uploadImage(uri, token)));
}

export default api;
