package database

import (
    "database/sql"
    "os"
    _ "github.com/lib/pq"
)

func InitDB() (*sql.DB, error) {
    connStr := os.Getenv("DB_CONNECTION")
    if connStr == "" {
        connStr = "postgres://postgres:postgres@localhost:5432/financial_tracker?sslmode=disable"
    }

    db, err := sql.Open("postgres", connStr)
    if err != nil {
        return nil, err
    }

    if err = db.Ping(); err != nil {
        return nil, err
    }

    return db, nil
}