import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center text-xl font-bold text-gray-800">
              Financial Tracker
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
            <Link to="/transactions" className="text-gray-600 hover:text-gray-900">Transactions</Link>
            <Link to="/add-transaction" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
              Add Transaction
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
