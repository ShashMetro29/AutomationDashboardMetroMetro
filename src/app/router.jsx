import { Navigate } from "react-router-dom";

import LoginPage from "../features/auth/pages/LoginPage";
import RegistrationPage from "../features/auth/pages/RegistrationPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import CountryPage from "../features/countries/pages/CountryPage";
import ApplicationListPage from "../features/applications/pages/ApplicationListPage";
import ApplicationDetailsPage from "../features/applications/pages/ApplicationDetailsPage";
//import ApplicationFormPage from "../features/applications/pages/ApplicationFormPage";

// import AppShell from "../components/layout/AppShell";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

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

//   {
//     element: (
//       <ProtectedRoute>
//         <AppShell />
//       </ProtectedRoute>
//     ),

  
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

    //   {
    //     path: "/applications/new",
    //     element: <ApplicationFormPage />,
    //   },

      {
        path: "/applications/:applicationId",
        element: <ApplicationDetailsPage />,
      },

    //   {
    //     path: "/applications/:applicationId/edit",
    //     element: <ApplicationFormPage />,
    //   },
    
  
];
