import { Navigate } from "react-router-dom";
 
import LoginPage from "../features/auth/pages/LoginPage";
import RegistrationPage from "../features/auth/pages/RegistrationPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CountryPage from "../features/countries/pages/CountryPage";
import ApplicationListPage from "../features/applications/pages/ApplicationListPage";
import ApplicationDetailsPage from "../features/applications/pages/ApplicationDetailsPage";
 
import MetroAppLayout from "../components/layout/MetroAppLayout";
 
const ProtectedRoute = ({ children }) => {
  let user = "india";
 
  try {
    user = JSON.parse(sessionStorage.getItem("user"));
  } catch {
    sessionStorage.removeItem("user");
  }
 
  if (!user) {
    return <Navigate to="/login" replace />;
  }
 
  return children;
};
 
export const router = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
 
  {
    path: "/login",
    element: <LoginPage />,
  },
 
  {
    path: "/register",
    element: <RegistrationPage />,
  },
 
  {
    element: (
      <ProtectedRoute>
        <MetroAppLayout />
      </ProtectedRoute>
    ),
 
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
 
      {
        path: "/countries",
        element: <CountryPage />,
      },
 
      {
        path: "/countries/:countryId/apps",
        element: <ApplicationListPage />,
      },
 
      {
        path: "/applications",
        element: <ApplicationListPage />,
      },
 
      {
        path: "/applications/:applicationId",
        element: <ApplicationDetailsPage />,
      },
    ],
  },
 
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];
 
 