package main

import (
    "log"
    "net/http"
    "github.com/gorilla/mux"
    "github.com/joho/godotenv"
    "github.com/kintatho/financial-tracker/internal/database"
    "github.com/kintatho/financial-tracker/internal/handlers"
    "github.com/kintatho/financial-tracker/internal/middleware"
)

func main() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize database
    db, err := database.InitDB()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }
    defer db.Close()

    // Initialize handlers
    transactionHandler := handlers.NewTransactionHandler(db)
    categoryHandler := handlers.NewCategoryHandler(db)

    // Initialize router
    r := mux.NewRouter()

    // Apply CORS middleware to all routes
    r.Use(middleware.CORS)

	r.HandleFunc("/transactions/monthly", transactionHandler.GetMonthlyReport).Methods("GET", "OPTIONS")


    // Transaction routes
    r.HandleFunc("/transactions", transactionHandler.CreateTransaction).Methods("POST", "OPTIONS")
    r.HandleFunc("/transactions", transactionHandler.GetTransactions).Methods("GET", "OPTIONS")
    r.HandleFunc("/transactions/{id}", transactionHandler.GetTransaction).Methods("GET", "OPTIONS")
    r.HandleFunc("/transactions/{id}", transactionHandler.UpdateTransaction).Methods("PUT", "OPTIONS")
    r.HandleFunc("/transactions/{id}", transactionHandler.DeleteTransaction).Methods("DELETE", "OPTIONS")

    // Category routes
    r.HandleFunc("/categories", categoryHandler.GetCategories).Methods("GET", "OPTIONS")
    r.HandleFunc("/categories", categoryHandler.CreateCategory).Methods("POST", "OPTIONS")

    log.Println("Server starting on :8080")
    if err := http.ListenAndServe(":8080", r); err != nil {
        log.Fatal(err)
    }
}