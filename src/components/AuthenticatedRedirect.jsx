import { Navigate } from "react-router-dom";

const AuthenticatedRedirect = ({ children }) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthenticatedRedirect;
