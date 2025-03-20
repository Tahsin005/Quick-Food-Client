import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { parseJwt } from "../utils/auth";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // Icons for password visibility

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(form.email)) {
      setEmailError("Invalid email format");
      return;
    }

    if (form.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("https://quick-food-server.onrender.com/api/auth/login/", form);
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      const userData = parseJwt(res.data.access);
      localStorage.setItem("user_role", userData.role);
      localStorage.setItem("user_id", userData.user_id);
      localStorage.setItem("user_email", userData.email);
      localStorage.setItem("user_balance", userData.balance);

      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error("Something went wrong. Please try later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {emailError && <p className="text-red-500 mt-1">{emailError}</p>}
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {passwordError && <p className="text-red-500 mt-1">{passwordError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
