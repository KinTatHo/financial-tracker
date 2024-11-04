import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import { api } from "../services/api";

function AddTransaction() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  useEffect(() => {
    api
      .getCategories()
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Error fetching categories:", err);
        showError("Failed to load categories");
      });
  }, []);

  const showError = (message) => {
    setNotificationMessage(message);
    setNotificationType("error");
    setShowNotification(true);
  };

  const showSuccess = (message) => {
    setNotificationMessage(message);
    setNotificationType("success");
    setShowNotification(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            showError('Please enter a valid amount');
            return;
        }

        if (!formData.category) {
            showError('Please select a category');
            return;
        }

        const transactionData = {
            ...formData,
            amount: parseFloat(formData.amount),
            date: new Date(formData.date).toISOString()
        };

        console.log('Sending transaction data:', transactionData); // Debug log

        const result = await api.createTransaction(transactionData);
        console.log('Transaction result:', result); // Debug log
        
        showSuccess('Transaction added successfully!');
        setTimeout(() => {
            navigate('/transactions');
        }, 2000);
    } catch (error) {
        console.error('Submission error:', error);
        showError(error.message || 'Failed to add transaction. Please try again.');
    }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        message={notificationMessage}
        type={notificationType}
      />

      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Add Transaction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories
              .filter((cat) => cat.type === formData.type)
              .map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/transactions")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTransaction;
