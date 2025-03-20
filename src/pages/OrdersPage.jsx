import { useState, useEffect } from "react";
import axios from "axios";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState({});
  const [restaurantsMap, setRestaurantsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const userRole = localStorage.getItem("user_role");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuItemsResponse, ordersResponse, restaurantsResponse] = await Promise.all([
          axios.get("https://quick-food-server.onrender.com/api/menu-items/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          }),
          axios.get("https://quick-food-server.onrender.com/api/orders/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          }),
          axios.get("https://quick-food-server.onrender.com/api/restaurants/", {
            headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
          })
        ]);

        // Create menu items map
        const menuItemsMap = {};
        menuItemsResponse.data.forEach(item => {
          menuItemsMap[item.id] = item;
        });
        setMenuItems(menuItemsMap);

        // Create restaurants map
        const restaurants = {};
        restaurantsResponse.data.forEach(restaurant => {
          restaurants[restaurant.id] = restaurant;
        });
        setRestaurantsMap(restaurants);

        setOrders(ordersResponse.data);
        console.log(ordersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    setCurrentOrderId(orderId);

    try {
      await axios.patch(
        `https://quick-food-server.onrender.com/api/orders/${orderId}/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`
          }
        }
      );

      setOrders(prevOrders => prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
      setCurrentOrderId(null);
    }
  };

  const getMenuItemName = (itemId) => {
    if (menuItems[itemId]) {
      return menuItems[itemId].name;
    }
    return `Item #${itemId}`;
  };

  const getMenuItemPrice = (itemId) => {
    if (menuItems[itemId]) {
      return menuItems[itemId].price;
    }
    return "N/A";
  };

  const getOrderRestaurants = (order) => {
    const restaurantIds = new Set();
    order.items.forEach(itemId => {
      const menuItem = menuItems[itemId];
      if (menuItem?.restaurant) {
        restaurantIds.add(menuItem.restaurant);
      }
    });
    return Array.from(restaurantIds).map(id => restaurantsMap[id]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Preparing":
        return "bg-blue-400 text-blue-800";
      case "Out for Delivery":
        return "bg-yellow-400 text-yellow-800";
      case "Delivered":
        return "bg-green-400 text-green-800";
      default:
        return "bg-gray-400 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p className="text-center text-lg">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">
        {userRole === 'restaurant_owner' ? 'All Orders' : 'Your Orders'}
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-lg">No orders found</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const restaurants = getOrderRestaurants(order);
            const statusColor = getStatusColor(order.status);
            return (
              <div
                key={order.id}
                className={`border rounded-lg shadow overflow-hidden ${statusColor}`}
              >
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h2 className="font-bold text-lg">Order #{order.id}</h2>
                      <p className="text-gray-600 text-sm mt-1">
                        Placed on {new Date(order.ordered_at).toLocaleString()}
                      </p>
                      {restaurants.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Restaurant:{" "}
                          {restaurants.map(restaurant => restaurant?.name).join(", ")}
                        </p>
                      )}
                    </div>

                    {userRole === 'restaurant_owner' ? (
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingStatus && currentOrderId === order.id}
                        className={`px-3 py-1 rounded border bg-white font-medium ${
                          updatingStatus && currentOrderId === order.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        <option value="Preparing">Preparing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium`}>
                        {order.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <ul className="divide-y">
                    {order.items.length > 0 ? (
                      order.items.map((item) => (
                        <li key={item} className="py-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">{getMenuItemName(item)}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {menuItems[item]?.description || ''}
                            </p>
                          </div>
                          <p className="font-medium text-gray-700">
                            ${getMenuItemPrice(item)}
                          </p>
                        </li>
                      ))
                    ) : (<div className="font-bold text-sm text-red-500">Restaurant owner discarded this menu item.</div>)}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
