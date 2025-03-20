import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";
import { X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const RestaurantDetails = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newDetails, setNewDetails] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    restaurant: id
  });
  const userRole = localStorage.getItem("user_role");
  const userId = localStorage.getItem("user_id");
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `https://quick-food-server.onrender.com/api/restaurants/${id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            },
          }
        );
        setRestaurant(response.data);
        if (userRole === 'restaurant_owner' && response.data.owner === parseInt(userId)) {
          setNewDetails({
            name: response.data.name,
            description: response.data.description,
            location: response.data.location,
          });
        }
      } catch (err) {
        setError(err);
        console.error('Error fetching restaurant:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, userId, userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDetails({
      ...newDetails,
      [name]: value,
    });
  };

  const handleDeleteRestaurant = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`https://quick-food-server.onrender.com/api/restaurants/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });

      toast.success("Restaurant deleted successfully!");
      navigate("/restaurants");
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      toast.error("Failed to delete restaurant. Please try again.");
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
        handleDeleteRestaurant();
      }
    });
  };

  const handleSaveChanges = async () => {
    try {
      await axios.patch(
        `https://quick-food-server.onrender.com/api/restaurants/${id}/`,
        newDetails,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      setRestaurant({
        ...restaurant,
        name: newDetails.name,
        description: newDetails.description,
        location: newDetails.location,
      });
      setEditing(false);
    } catch (err) {
      setError(err);
      console.error('Error updating restaurant:', err);
    }
  };

    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'https://quick-food-server.onrender.com/api/menu-items/',
                newMenuItem,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    }
                }
            );

            setRestaurant(prev => ({
                ...prev,
                menu_items: [...prev.menu_items, response.data]
            }));

            setNewMenuItem({
                name: '',
                description: '',
                price: '',
                restaurant: id
            });
            setShowAddForm(false);
        } catch (err) {
            setError(err.response?.data || 'Failed to create menu item');
        }
    };

    const renderAddMenuItemForm = () => {
        if (userRole !== 'restaurant_owner' || restaurant?.owner !== parseInt(userId)) {
            return null;
        }

        return (
            <section className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add Menu Item</h3>
                <form onSubmit={handleAddMenuItem} className="mb-6 space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Item Name</label>
                        <input
                            type="text"
                            value={newMenuItem.name}
                            onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Description</label>
                        <textarea
                            value={newMenuItem.description}
                            onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Price</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newMenuItem.price}
                            onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Menu Item
                    </button>
                </form>
            </section>
        );
    };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error.message}</div>;
  }

  if (!restaurant) {
    return <div className="flex justify-center items-center h-screen">Restaurant not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <Toaster position="top-right" reverseOrder={false} />
      <header className="bg-white shadow-md rounded-lg p-6 mb-6 relative">
         {editing && (
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className={`absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-lg transition ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDeleting ? "Deleting..." : <X />}
          </button>
        )}
        {editing ? (
          <input
            type="text"
            name="name"
            value={newDetails.name}
            onChange={handleInputChange}
            className="w-full border rounded p-2 mb-2"
          />
        ) : (
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{restaurant.name}</h2>
        )}
        {editing ? (
          <textarea
            name="description"
            value={newDetails.description}
            onChange={handleInputChange}
            className="w-full border rounded p-2 mb-2"
          />
        ) : (
          <p className="text-gray-600 mb-4">{restaurant.description}</p>
        )}
        {editing ? (
          <input
            type="text"
            name="location"
            value={newDetails.location}
            onChange={handleInputChange}
            className="w-full border rounded p-2 mb-2"
          />
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              <i className="fas fa-map-marker-alt mr-2"></i>
              {restaurant.location}
            </span>
          </div>
        )}
        {userRole === 'restaurant_owner' && restaurant.owner === parseInt(userId) && (
          <div className="flex justify-end mt-2">
            {editing ? (
              <button
                onClick={handleSaveChanges}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit Details
              </button>
            )}
          </div>
        )}
      </header>

        {renderAddMenuItemForm()}

      <section className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Menu Items</h3>
        {restaurant.menu_items.length === 0 ? (
          <p className="text-center text-lg">No menu items available for this restaurant.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurant.menu_items.map((item) => (
              <Link key={item.id} to={`/menu-item/${item.id}`} state={{ restaurantId: restaurant.id }} className="block">
                <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="p-4">
                    <strong className="block text-lg font-medium text-gray-900 mb-1">{item.name}</strong>
                    <span className="block text-green-600 mb-2">${item.price}</span>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default RestaurantDetails;
