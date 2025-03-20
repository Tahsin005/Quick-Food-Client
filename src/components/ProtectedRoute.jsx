import { Navigate } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return null;
      }

      const response = await axios.get("https://quick-food-server.onrender.com/api/auth/users/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      return response.data;
    } catch (err) {
      console.error("Error fetching user data:", err);
      return null;
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      const response = await axios.post("https://quick-food-server.onrender.com/api/auth/refresh/", {
        refresh: refreshToken,
      });

      localStorage.setItem("access_token", response.data.access);
      return response.data.access;
    } catch (err) {
      console.error("Error refreshing token:", err);
      return null;
    }
  };

  const checkAuthentication = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return false;
    }

    try {
      const response = await axios.get("https://quick-food-server.onrender.com/api/auth/users/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.status === 401) {
        const newAccessToken = await refreshToken();
        if (!newAccessToken) {
          return false;
        }

        const newData = await fetchUserData();
        if (!newData) {
          return false;
        }
        localStorage.setItem("user_role", newData.role);
        localStorage.setItem("user_id", newData.id);
        localStorage.setItem("user_email", newData.email);
        localStorage.setItem("user_balance", newData.balance);
      } else {
        localStorage.setItem("user_role", response.data.role);
        localStorage.setItem("user_id", response.data.id);
        localStorage.setItem("user_email", response.data.email);
        localStorage.setItem("user_balance", response.data.balance);
      }

      return true;
    } catch (err) {
      console.error("Error checking authentication:", err);
      return false;
    }
  };

  const checkRole = async () => {
    const authenticated = await checkAuthentication();
    if (!authenticated) {
      navigate("/login");
      return false;
    }

    const userData = {
      role: localStorage.getItem("user_role"),
      id: localStorage.getItem("user_id"),
      email: localStorage.getItem("user_email"),
      balance: localStorage.getItem("user_balance"),
    };

    if (allowedRoles && !allowedRoles.includes(userData.role)) {
      navigate("/unauthorized");
      return false;
    }

    return true;
  };

  checkRole().then((success) => {
    if (!success) {
      return;
    }
  });

  return children;
};

export default ProtectedRoute;
