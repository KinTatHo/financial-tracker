import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-1 w-full">
          <div className="container mx-auto px-4 py-8 w-full max-w-full">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/add-transaction" element={<AddTransaction />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;