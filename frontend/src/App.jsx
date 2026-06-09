import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CompanyProfile from "./page/CompanyProfile";
import LoginAdmin from "./page/LoginAdmin";
import Dashboard from "./page/AdminDashboard";
import ProtectedRoute from "./protectedRoute";
import UserDashboard from "./page/UserDashboard";
import UserProtectedRoute from "./userProtectedRoute";


export default function HomePage() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CompanyProfile />} />
        <Route path="/admin">
          <Route path="login" element={<LoginAdmin />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route index element={<Navigate to="/admin/login" replace />} />
        </Route>
        <Route path="/dashboard" element={<UserProtectedRoute><UserDashboard /></UserProtectedRoute>} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}