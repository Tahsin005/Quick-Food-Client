import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = localStorage.getItem("access_token") !== null;
  const isUser = localStorage.getItem("user_role") === "user";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_balance");

    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          QuickFood
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          {isAuthenticated && (
            <>
              <Link to="/restaurants" className="text-gray-700 hover:text-blue-500 transition">
                Restaurants
              </Link>
              <Link to="/orders" className="text-gray-700 hover:text-blue-500 transition">
                Orders
              </Link>
              {isUser && (
                <Link to="/deposit" className="text-gray-700 hover:text-blue-500 transition">
                  Deposit
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-md transition"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </>
          )}
        </div>

        {isAuthenticated && (
            <button
            className="md:hidden text-gray-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md p-4 space-y-4 text-center">
          {isAuthenticated && (
            <>
              <Link
                to="/restaurants"
                className="block text-gray-700 hover:text-blue-500 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                to="/orders"
                className="block text-gray-700 hover:text-blue-500 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
              {isUser && (
                <Link
                  to="/deposite"
                  className="block text-gray-700 hover:text-blue-500 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Deposit
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded-md transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
