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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border">
          <p className="text-gray-600 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="font-medium"
            >
              {entry.name === "income" ? "Income" : "Expenses"}: $
              {Math.abs(entry.value).toFixed(2)}
            </p>
          ))}
          {payload[0] && payload[1] && (
            <p className="text-gray-600 border-t mt-2 pt-2">
              Net: ${(payload[0].value - payload[1].value).toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMonthlyReport();

      // Process the data
      const processedData = data
        .map((item) => ({
          month: formatMonth(item.month),
          income: Number(item.total_income.toFixed(2)),
          expenses: Number(item.total_expenses.toFixed(2)),
          net: Number((item.total_income - item.total_expenses).toFixed(2)),
        }))
        .reverse(); // Show oldest to newest

      setMonthlyData(processedData);

      // Calculate summary
      const totals = processedData.reduce(
        (acc, curr) => ({
          totalIncome: acc.totalIncome + curr.income,
          totalExpenses: acc.totalExpenses + curr.expenses,
        }),
        { totalIncome: 0, totalExpenses: 0 }
      );

      setSummary({
        ...totals,
        balance: totals.totalIncome - totals.totalExpenses,
      });
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
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
            <BarChart
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "#6B7280" }} />
              <YAxis
                tick={{ fill: "#6B7280" }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              />
              <Legend />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="expenses"
                name="Expenses"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
