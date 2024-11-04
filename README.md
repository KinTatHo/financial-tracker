# Financial Tracker

A full-stack application for tracking personal finances, built with Go (backend) and React (frontend). This application helps users manage their income and expenses, visualize spending patterns, and maintain financial records.

## Features

- 💰 Track income and expenses
- 📊 Visualize monthly financial data with interactive charts
- 🏷️ Categorize transactions
- 📱 Responsive design for desktop and mobile
- 📈 Real-time updates and calculations
- 🔄 CRUD operations for transactions

## Tech Stack

### Backend
- Go
- Gorilla Mux (HTTP router)
- PostgreSQL (Database)
- CORS middleware

### Frontend
- React
- Tailwind CSS
- Recharts (for charts)
- React Router
- Fetch API

## Prerequisites

Before running this project, make sure you have the following installed:
- Go (1.16 or later)
- Node.js (14.0 or later)
- PostgreSQL (13.0 or later)
- npm or yarn

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/kintatho/financial-tracker.git
cd financial-tracker
```

2. Set up the PostgreSQL database:
```sql
CREATE DATABASE financial_tracker;
```

3. Run the database migrations:
```sql
-- Create transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(50) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    UNIQUE (name, type)
);
```

4. Create a `.env` file in the root directory:
```env
DB_CONNECTION=postgres://username:password@localhost:5432/financial_tracker?sslmode=disable
```

5. Install Go dependencies:
```bash
go mod tidy
```

6. Run the backend server:
```bash
go run cmd/api/main.go
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
financial-tracker/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── models/
│   │   ├── transaction.go
│   │   └── category.go
│   ├── handlers/
│   │   ├── transaction_handler.go
│   │   └── category_handler.go
│   └── database/
│       └── db.go
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── .env
├── .gitignore
└── go.mod
```

## API Endpoints

### Transactions
- `GET /transactions` - Get all transactions
- `POST /transactions` - Create a new transaction
- `GET /transactions/{id}` - Get a specific transaction
- `PUT /transactions/{id}` - Update a transaction
- `DELETE /transactions/{id}` - Delete a transaction
- `GET /transactions/monthly` - Get monthly report

### Categories
- `GET /categories` - Get all categories
- `POST /categories` - Create a new category

## Features in Detail

### Transaction Management
- Create, read, update, and delete transactions
- Categorize transactions as income or expense
- Add descriptions and dates
- Filter transactions by type and category

### Financial Dashboard
- Monthly income vs expenses chart
- Total income, expenses, and balance
- Transaction history
- Category-wise breakdown

### Data Visualization
- Interactive bar charts
- Monthly comparisons
- Real-time updates
- Hover tooltips with detailed information

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- [Gorilla Mux](https://github.com/gorilla/mux)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)

## Contact

Your Name - [kintath@example.com]
Project Link: [https://github.com/kintatho/financial-tracker](https://github.com/kintatho/financial-tracker)