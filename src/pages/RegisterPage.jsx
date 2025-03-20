import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "user",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const hasSpaces = formData.username.includes(' ');

    if (hasSpaces) {
      setLoading(false);
      toast.error("Username cannot contains spaces.");
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("All fields are required!");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      await axios.post("https://quick-food-server.onrender.com/api/auth/register/", formData);
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.log(err.response.status);
      if (err.response?.status == 400) {
        toast.error("Username or Email is already in use.");
      } else {

        toast.error(err.response?.data?.detail || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="user">User</option>
              <option value="restaurant_owner">Restaurant Owner</option>
            </select>
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
