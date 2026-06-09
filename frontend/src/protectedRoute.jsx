import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }
    const data = token ? jwtDecode(token) : null;
    if(!data?.isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    try {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
            // console.log("Token expired, logging out...");
            localStorage.removeItem("token");
            return <Navigate to="/admin/login" replace />;
        } else {
            return children;
        }
    } catch {
        return children;
    }

};

export default ProtectedRoute;