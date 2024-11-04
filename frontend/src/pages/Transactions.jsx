import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EditTransactionModal from "../components/EditTransactionModal";
import Notification from "../components/Notification";
import { api } from "../services/api";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [transactionsData, categoriesData] = await Promise.all([
        api.getTransactions(),
        api.getCategories(),
      ]);
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (error) {
      showNotification("Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await api.updateTransaction(id, formData);
      showNotification("Transaction updated successfully", "success");
      fetchData();
      setEditingTransaction(null);
    } catch (error) {
      showNotification(
        error.message || "Failed to update transaction",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    try {
        setTransactions(prev => prev.filter(t => t.id !== id));
        showNotification('Transaction deleted successfully', 'success');

        await api.deleteTransaction(id);
    } catch (error) {
        showNotification('Failed to delete transaction', 'error');
        fetchData();
    }
};

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, show: false });
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <Notification
        show={notification.show}
        setShow={(show) => setNotification({ ...notification, show })}
        message={notification.message}
        type={notification.type}
      />

      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
        <Link
          to="/add-transaction"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add New
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions found. Add your first transaction!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{transaction.category}</td>
                  <td className="px-6 py-4">{transaction.description}</td>
                  <td className="px-6 py-4 font-medium">
                    <span
                      className={
                        transaction.type === "income"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        transaction.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setEditingTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingTransaction && (
        <EditTransactionModal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
          onUpdate={handleUpdate}
          categories={categories}
        />
      )}
    </div>
  );
}

export default Transactions;
