import { Navigate } from "react-router-dom";

function LoginRoute({ children }) {
  const token = localStorage.getItem("token");
  const bogusMode = localStorage.getItem("bogusMode");

  if (bogusMode) {
    return <Navigate to="/myuser" replace />;
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default LoginRoute;