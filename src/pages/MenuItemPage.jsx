import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { X, Loader } from 'lucide-react';

const MenuItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantId = location.state?.restaurantId;

  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    const fetchMenuItem = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://quick-food-server.onrender.com/api/menu-items/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setMenuItem(response.data);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch menu item.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]);

  const handleEdit = async () => {
    setIsSavingChanges(true);
    try {
      await axios.put(
        `https://quick-food-server.onrender.com/api/menu-items/${id}/`,
        {
          restaurant: restaurantId,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );
      setIsEditing(false);
      toast.success("Changes saved successfully!");
    } catch (err) {
      console.log(err);
      setError("Failed to save changes.");
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSavingChanges(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`https://quick-food-server.onrender.com/api/menu-items/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      toast.success("Menu item deleted successfully!");
      navigate(-1);
    } catch (err) {
      console.log(err);
      setError("Failed to delete menu item.");
      toast.error("Failed to delete menu item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete();
      }
    });
  };

  const handleOrder = async () => {
    setIsPlacingOrder(true);
    const result = await Swal.fire({
      title: "Confirm Order",
      text: "Are you sure you want to place this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, order now!",
    });

    if (result.isConfirmed) {
      try {
        await axios.post(
          "https://quick-food-server.onrender.com/api/orders/",
          {
            user: localStorage.getItem("user_id"),
            status: "Preparing",
            items: [id],
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        toast.success("Order placed successfully!");
        navigate("/orders");
      } catch (err) {
        console.log(err);
        toast.error("Not enough balance.");
        navigate('/deposit')
      }
    }
    setIsPlacingOrder(false);
  };

  if (!userRole) navigate("/login");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">{error}</div>
    );
  }

  if (!menuItem) {
    return <div className="flex justify-center items-center h-screen">Menu item not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="bg-white shadow-md rounded-lg p-6 relative">
        {isEditing && (
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className={`absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? <Loader /> : <X />}
          </button>
        )}
        <h2 className="text-3xl font-bold text-gray-800">{menuItem.name}</h2>
        <p className="text-gray-600 mt-2">{menuItem.description}</p>
        <p className="text-green-600 font-bold mt-4 text-xl">${menuItem.price}</p>

        {userRole === "user" ? (
          <button
            onClick={handleOrder}
            disabled={isPlacingOrder}
            className={`mt-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition ${
              isPlacingOrder ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isPlacingOrder ? "Placing Order..." : "Order Now"}
          </button>
        ) : (
          <div className="mt-5">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={menuItem.name}
                  onChange={(e) => setMenuItem({ ...menuItem, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
                <textarea
                  value={menuItem.description}
                  onChange={(e) => setMenuItem({ ...menuItem, description: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="number"
                  value={menuItem.price}
                  onChange={(e) => setMenuItem({ ...menuItem, price: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleEdit}
                  disabled={isSavingChanges}
                  className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition ${
                    isSavingChanges ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSavingChanges ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Edit Menu Item
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuItemPage;
