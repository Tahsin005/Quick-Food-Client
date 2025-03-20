import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import RestaurantDetails from "./pages/RestaurantDetails";
import MenuItemPage from "./pages/MenuItemPage";
import OrdersPage from "./pages/OrdersPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./components/Layout";
import Restaurants from "./pages/Restaurants";
import Deposit from "./pages/Deposit";
import AuthenticatedRedirect from "./components/AuthenticatedRedirect";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<AuthenticatedRedirect><LoginPage /></AuthenticatedRedirect>} />
        <Route path="/register" element={<AuthenticatedRedirect><RegisterPage /></AuthenticatedRedirect>} />
        <Route path="/" element={<HomePage />} />

        <Route path="/restaurants/" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
        <Route path="/restaurant/:id" element={<ProtectedRoute><RestaurantDetails /></ProtectedRoute>} />
        <Route path="/menu-item/:id" element={<ProtectedRoute><MenuItemPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
      </Routes>
    </Layout>
  )
}
