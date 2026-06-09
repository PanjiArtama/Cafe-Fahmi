import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const UserProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/" replace />;
    }
    const data = token ? jwtDecode(token) : null;
    if(data?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    try {
        const { exp } = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
            // console.log("Token expired, logging out...");
            localStorage.removeItem("token");
            return <Navigate to="/" replace />;
        } else {
            return children;
        }
    } catch {
        return children;
    }

};

export default UserProtectedRoute;