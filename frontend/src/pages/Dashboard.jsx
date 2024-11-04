import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS } from "../constants/Colors";
import { api } from "../services/api";

function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 shadow rounded border">
          <p className="text-sm font-semibold">{data.name}</p>
          <p className="text-sm">${data.value.toFixed(2)}</p>
          <p className="text-sm text-gray-500">
            {(
              (data.value /
                (data.payload.type === "expense"
                  ? summary.totalExpenses
                  : summary.totalIncome)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    // Fetch monthly report
    api
      .getMonthlyReport()
      .then((data) => {
        // Process the data
        const processedData = data.map((item) => ({
          month: formatMonth(item.month),
          income: Number(item.total_income),
          expenses: Number(item.total_expenses),
          net: Number(item.net_amount),
        }));

        setMonthlyData(processedData);

        // Calculate summary
        const latestSummary = processedData.reduce(
          (acc, curr) => ({
            totalIncome: acc.totalIncome + curr.income,
            totalExpenses: acc.totalExpenses + curr.expenses,
          }),
          { totalIncome: 0, totalExpenses: 0 }
        );

        setSummary({
          ...latestSummary,
          balance: latestSummary.totalIncome - latestSummary.totalExpenses,
        });
      })
      .catch((error) => {
        console.error("Error fetching monthly data:", error);
      });
  }, []);

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    // Fetch data from your API
    api.getTransactions().then((data) => {
      // Calculate summary
      const totals = data.reduce(
        (acc, transaction) => {
          if (transaction.type === "income") {
            acc.totalIncome += transaction.amount;
          } else {
            acc.totalExpenses += transaction.amount;
          }
          return acc;
        },
        { totalIncome: 0, totalExpenses: 0 }
      );

      setSummary({
        ...totals,
        balance: totals.totalIncome - totals.totalExpenses,
      });

      const expenseCategories = {};
      const incomeCategories = {};

      data.forEach((transaction) => {
        if (transaction.type === "expense") {
          expenseCategories[transaction.category] =
            (expenseCategories[transaction.category] || 0) + transaction.amount;
        } else {
          incomeCategories[transaction.category] =
            (incomeCategories[transaction.category] || 0) + transaction.amount;
        }
      });

      // Convert to array format for pie charts
      setExpensesByCategory(
        Object.entries(expenseCategories).map(([name, value]) => ({
          name,
          value,
        }))
      );

      setIncomeByCategory(
        Object.entries(incomeCategories).map(([name, value]) => ({
          name,
          value,
        }))
      );

      setMonthlyData(Object.entries());
    });
  }, []);

  return (
    <div className="flex-1 space-y-6">
      {/* Existing summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${summary.totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">
            Total Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600">
            ${summary.totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Balance</h3>
          <p
            className={`text-2xl font-bold ${
              summary.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${summary.balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expenses Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Expenses by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Income by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeByCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {incomeByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Monthly Overview
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Income" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
