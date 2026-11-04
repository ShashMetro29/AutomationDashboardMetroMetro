// src/app/App.jsx

import { useRoutes } from "react-router-dom";
import { router } from "./router";

export default function App() {
  return useRoutes(router);
}