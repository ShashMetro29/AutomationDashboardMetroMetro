import axios from "axios";

import { getStoredAuthSession } from "./authService";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  headers: {
    "Content-Type": "application/json",
  },
});

const getAuthHeaders = () => {
  const token = getStoredAuthSession()?.accessToken;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

const normalizeArrayResponse = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (Array.isArray(responseData?.data)) {
    return responseData.data;
  }

  if (Array.isArray(responseData?.applications)) {
    return responseData.applications;
  }

  if (Array.isArray(responseData?.items)) {
    return responseData.items;
  }

  return [];
};

export const getApplicationsByCountry = async (countryId) => {
  const response = await apiClient.get("/api/v1/applications/details", {
    params: { countryId },
    headers: getAuthHeaders(),
  });

  return normalizeArrayResponse(response.data);
};

export const createApplication = async (payload) => {
  const response = await apiClient.post("/api/v1/applications", payload, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const createEnvironment = async (payload) => {
  const response = await apiClient.post("/api/v1/environments", payload, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const createComponent = async (payload) => {
  const response = await apiClient.post("/api/v1/components", payload, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const updateApplication = async (applicationId, payload) => {
  const response = await apiClient.patch(`/api/v1/applications/${applicationId}`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const deleteApplication = async (applicationId) => {
  const response = await apiClient.delete(`/api/v1/applications/${applicationId}`, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const updateEnvironment = async (environmentId, payload) => {
  const response = await apiClient.patch(`/api/v1/environments/${environmentId}`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const deleteEnvironment = async (environmentId) => {
  const response = await apiClient.delete(`/api/v1/environments/${environmentId}`, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const updateComponent = async (componentId, payload) => {
  const response = await apiClient.patch(`/api/v1/components/${componentId}`, payload, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};

export const deleteComponent = async (componentId) => {
  const response = await apiClient.delete(`/api/v1/components/${componentId}`, {
    headers: getAuthHeaders(),
  });

  return response.data ?? {};
};
