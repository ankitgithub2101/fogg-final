import { Navigate } from "react-router-dom";

function BogusRoute({ children }) {
  const bogusMode = localStorage.getItem("bogusMode");

  if (!bogusMode) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default BogusRoute;