import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import { X } from 'lucide-react';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    owner: parseInt(localStorage.getItem("user_id")),
    name: "",
    description: "",
    location: "",
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const userRole = localStorage.getItem("user_role");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingRestaurant, setIsAddingRestaurant] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = () => {
      setIsLoading(true);
      let baseURL = "https://quick-food-server.onrender.com/api/restaurants/";
      if (searchQuery.length > 0) {
        baseURL += `?query=${searchQuery}`;
      }
      axios
        .get(baseURL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        })
        .then((res) => {
          if (userRole === "restaurant_owner") {
            setRestaurants(res.data.filter((r) => r.owner === parseInt(localStorage.getItem("user_id"))));
          } else {
            setRestaurants(res.data);
          }
          setIsSearching(false);
          setIsLoading(false);
        })
        .catch((err) => console.error(err));
    };

    fetchRestaurants();
  }, [userRole, searchQuery]);

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    setIsAddingRestaurant(true);
    try {
      const response = await axios.post("https://quick-food-server.onrender.com/api/restaurants/", newRestaurant, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setRestaurants((prevRestaurants) => [...prevRestaurants, response.data]);
      setNewRestaurant({
        owner: parseInt(localStorage.getItem("user_id")),
        name: "",
        description: "",
        location: "",
      });
      setShowAddForm(false);
      toast.success("Restaurant added successfully!");
    } catch (err) {
      console.error("Error adding restaurant:", err);
      toast.error("Failed to add restaurant. Please try again.");
    } finally {
      setIsAddingRestaurant(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    setIsDeleting(true);
    setCurrentRestaurantId(restaurantId);

    try {
      await axios.delete(`https://quick-food-server.onrender.com/api/restaurants/${restaurantId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });

      setRestaurants((prevRestaurants) => prevRestaurants.filter((r) => r.id !== restaurantId));
      toast.success("Restaurant deleted successfully!");
      navigate("/restaurants");
    } catch (err) {
      console.error("Error deleting restaurant:", err);
      toast.error("Failed to delete restaurant. Please try again.");
    } finally {
      setIsDeleting(false);
      setCurrentRestaurantId(null);
    }
  };

  const confirmDelete = (restaurantId) => {
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
        handleDeleteRestaurant(restaurantId);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Restaurants</h1>
        {userRole === "restaurant_owner" && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            {showAddForm ? "Cancel" : "Add New Restaurant"}
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRestaurant} className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add New Restaurant</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Description</label>
              <textarea
                name="description"
                value={newRestaurant.description}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={newRestaurant.location}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, location: e.target.value })}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isAddingRestaurant}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition ${
                isAddingRestaurant ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isAddingRestaurant ? "Adding..." : "Add Restaurant"}
            </button>
          </div>
        </form>
      )}

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {isSearching ? (
        <p className="text-center text-lg text-gray-600">Searching...</p>
      ) : restaurants.length === 0 ? (
        (isLoading ? <p className="text-center text-lg text-gray-600">Loading...</p> : <p className="text-center text-lg text-red-600">No restaurants found...</p>)
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105">
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{restaurant.name}</h2>
                <p className="text-gray-600 mb-1">{restaurant.description}</p>
                <p className="text-sm text-gray-500">{restaurant.location}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurants;
