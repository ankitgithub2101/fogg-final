import { useState, useEffect } from "react";
import API from "../api";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showToast = (type, message) => {
    const toast = document.getElementById(`toast-${type}`);
    if (!toast) return;
    toast.querySelector("div.toast-message").textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.post("/login", form);

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        showToast("success", "Login successful!");
        setTimeout(() => navigate("/dashboard", { replace: true }), 500);
      } else if (data.redirectBogus) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.setItem("bogusMode", "true");
        showToast("warning", "Logged in as bogus user!");
        setTimeout(() => navigate("/myuser", { replace: true }), 500);
      } else {
        showToast(
          "danger",
          data.message || `Wrong password. Attempts left: ${data.attemptsLeft}`
        );
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        showToast("danger", error.response.data.message || "Invalid login");
      } else {
        console.error(error);
        showToast("danger", "Something went wrong. Try again.");
      }
    }
  };

  useEffect(() => {
    const bogusMode = localStorage.getItem("bogusMode");
    const token = localStorage.getItem("token");

    if (bogusMode) {
      window.location.replace("/myuser");
      return;
    }

    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      {/* Toasts */}
      <div
        id="toast-success"
        className="hidden flex items-center w-full max-w-sm p-4 bg-green-100 text-green-800 rounded-lg shadow fixed top-4 right-4 z-50"
        role="alert"
      >
        <div className="inline-flex items-center justify-center w-7 h-7 bg-green-200 text-green-700 rounded-full">
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="ml-3 text-sm font-normal toast-message"></div>
      </div>

      <div
        id="toast-danger"
        className="hidden flex items-center w-full max-w-sm p-4 bg-red-100 text-red-800 rounded-lg shadow fixed top-4 right-4 z-50"
        role="alert"
      >
        <div className="inline-flex items-center justify-center w-7 h-7 bg-red-200 text-red-700 rounded-full">
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div className="ml-3 text-sm font-normal toast-message"></div>
      </div>

      <div
        id="toast-warning"
        className="hidden flex items-center w-full max-w-sm p-4 bg-yellow-100 text-yellow-800 rounded-lg shadow fixed top-4 right-4 z-50"
        role="alert"
      >
        <div className="inline-flex items-center justify-center w-7 h-7 bg-yellow-200 text-yellow-700 rounded-full">
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"
            />
          </svg>
        </div>
        <div className="ml-3 text-sm font-normal toast-message"></div>
      </div>

     {/* Login Form */}
<div className="bg-white p-8 rounded-2xl shadow-lg w-96">
  <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">
    Login
  </h2>

  <form onSubmit={handleSubmit}>
    <input
      name="email"
      placeholder="Email"
      onChange={handleChange}
      className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <input
      name="password"
      type="password"
      placeholder="Password"
      onChange={handleChange}
      className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

    {/* Forgot Password link styled */}
    <div className="text-center mb-6">
      <Link
        to="/forgot-password"
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
      >
        Forgot Password?
      </Link>
    </div>

    <button
      type="submit"
      className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
    >
      Login
    </button>
  </form>

  <p className="text-center mt-6 text-gray-600">
    Don't have an account?{" "}
    <Link
      to="/signup"
      className="text-blue-600 font-semibold hover:underline"
    >
      Signup
    </Link>
  </p>
</div>
    </div>
  );
}

export default Login;