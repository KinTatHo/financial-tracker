import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
        <Link
          to="/add-transaction"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add New
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-black">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-black">{transaction.category}</td>
                <td className="px-6 py-4 text-black">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 text-black">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-black">
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
