import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const Deposit = () => {
  const [amount, setAmount] = useState("");
  const [userId] = useState(parseInt(localStorage.getItem("user_id")));
  const [balance, setBalance] = useState(0);
  const [isDepositing, setIsDepositing] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get(`https://quick-food-server.onrender.com/api/auth/users/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        setBalance(response.data.balance);
      } catch (err) {
        console.error("Error fetching balance:", err);
      }
    };
    fetchBalance();
  }, []);

  const handleAmountChange = (e) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      setAmount(input);
    } else {
      toast.error("Deposit amount must be an integer");
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount.includes(".")) {
      toast.error("Deposit amount must be a valid integer");
      return;
    }

    setIsDepositing(true);
    try {
      await axios.patch(
        `https://quick-food-server.onrender.com/api/auth/users/${userId}/deposit/`,
        { amount: parseInt(amount) },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );

      const newBalance = parseFloat(balance) + parseFloat(amount);
      setBalance(newBalance);
      localStorage.setItem("user_balance", newBalance);
      setAmount("");

      toast.success("Deposit successful!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to deposit money");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Deposit Money</h2>

        <p className="text-lg text-center text-gray-700 mb-4">
          Current Balance: <span className="font-semibold text-blue-600">${balance}</span>
        </p>

        <form onSubmit={handleDeposit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!amount || isDepositing}
            className={`w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition ${
              !amount || isDepositing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isDepositing ? "Depositing..." : "Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Deposit;
