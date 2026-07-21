import axios from "axios";

const BASE_URL = "https://api.mfapi.in/mf";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
apiClient.interceptors.request.use((config) => {
  console.log("[API] →", config.baseURL! + (config.url || ""));
  return config;
});

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    const url = response.config.baseURL! + (response.config.url || "");
    console.log("[API] ←", response.status, url);
    console.log(
      "[API] Response:",
      JSON.stringify(response.data, null, 2).slice(0, 2000),
    );
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const url = error.config?.baseURL! + (error.config?.url || "");
      console.log("[API] ✗", url, error.message);
    }
    return Promise.reject(error);
  },
);

export { BASE_URL };
