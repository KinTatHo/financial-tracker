package models

import (
    "time"
)

type TransactionType string

const (
    Income  TransactionType = "income"
    Expense TransactionType = "expense"
)

type Transaction struct {
    ID          int64           `json:"id"`
    Amount      float64         `json:"amount"`
    Type        TransactionType `json:"type"`
    Category    string          `json:"category"`
    Description string          `json:"description"`
    Date        time.Time       `json:"date"`
    CreatedAt   time.Time       `json:"created_at"`
}

type MonthlyReport struct {
    Month          string  `json:"month"`
    TotalIncome    float64 `json:"total_income"`
    TotalExpenses  float64 `json:"total_expenses"`
    NetAmount      float64 `json:"net_amount"`
}