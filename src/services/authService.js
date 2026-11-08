import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  headers: {
    "Content-Type": "application/json",
  },
});

export const getStoredAuthSession = () => {
  const rawSession = localStorage.getItem("authSession");

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch (error) {
    localStorage.removeItem("authSession");
    return null;
  }
};

export const setStoredAuthSession = (authSession) => {
  localStorage.setItem("authSession", JSON.stringify(authSession));
};

export const clearStoredAuthSession = () => {
  localStorage.removeItem("authSession");
};

export const getAuthUser = () => getStoredAuthSession()?.user ?? null;
export const getAuthCountry = () => getStoredAuthSession()?.country ?? null;

export const getUserDisplayName = (user = getAuthUser()) => {
  if (!user) {
    return "User";
  }

  return user.displayName || user.display_name || user.email || "User";
};

export const getUserInitials = (user = getAuthUser()) => {
  const displayName = getUserDisplayName(user);

  if (!displayName || displayName === "User") {
    return "U";
  }

  return displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "U";
};

const getBearerHeaders = (type = "login") => {
  const tokenKey = type === "signup" ? "VITE_SIGNUP_BEARER_TOKEN" : "VITE_LOGIN_BEARER_TOKEN";
  const token = import.meta.env[tokenKey];

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const loginUser = async (credentials) => {
  const response = await apiClient.post("/api/v1/auth/login", credentials, {
    headers: getBearerHeaders("login"),
  });

  return response;
};

export const signupUser = async (payload) => {
  const response = await apiClient.post("/api/v1/auth/signup", payload, {
    headers: getBearerHeaders("signup"),
  });

  return response;
};
