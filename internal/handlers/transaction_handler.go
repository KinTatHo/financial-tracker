package handlers

import (
    "database/sql"
    "encoding/json"
	"fmt"
    "net/http"
    "time"
    "strconv"
    "github.com/gorilla/mux"
    "github.com/kintatho/financial-tracker/internal/models"
)

type TransactionHandler struct {
    db *sql.DB
}

func NewTransactionHandler(db *sql.DB) *TransactionHandler {
    return &TransactionHandler{db: db}
}

func (h *TransactionHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
    var trans models.Transaction
    if err := json.NewDecoder(r.Body).Decode(&trans); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }
    
    // Set creation time
    trans.CreatedAt = time.Now()
    
    // Validate transaction type
    if trans.Type != models.Income && trans.Type != models.Expense {
        http.Error(w, "Invalid transaction type. Must be 'income' or 'expense'", http.StatusBadRequest)
        return
    }

    // Validate amount
    if trans.Amount <= 0 {
        http.Error(w, "Amount must be greater than 0", http.StatusBadRequest)
        return
    }

    // Check if category exists
    var categoryExists bool
    err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM categories WHERE name = $1 AND type = $2)", 
        trans.Category, trans.Type).Scan(&categoryExists)
    
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if !categoryExists {
        http.Error(w, "Invalid category for the transaction type", http.StatusBadRequest)
        return
    }

    // Insert the transaction
    err = h.db.QueryRow(`
        INSERT INTO transactions (amount, type, category, description, date, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        trans.Amount,
        trans.Type,
        trans.Category,
        trans.Description,
        trans.Date,
        trans.CreatedAt,
    ).Scan(&trans.ID)

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(trans)
}

func (h *TransactionHandler) GetTransactions(w http.ResponseWriter, r *http.Request) {
    // Get query parameters for filtering
    queryParams := r.URL.Query()
    
    // Base query
    query := `
        SELECT id, amount, type, category, description, date, created_at
        FROM transactions
        WHERE 1=1`
    
    // Create a slice to hold our query parameters
    var params []interface{}
    paramCount := 1

    // Add type filter if provided
    if transType := queryParams.Get("type"); transType != "" {
        query += fmt.Sprintf(" AND type = $%d", paramCount)
        params = append(params, transType)
        paramCount++
    }

    // Add category filter if provided
    if category := queryParams.Get("category"); category != "" {
        query += fmt.Sprintf(" AND category = $%d", paramCount)
        params = append(params, category)
        paramCount++
    }

    // Add date range filter if provided
    if startDate := queryParams.Get("start_date"); startDate != "" {
        query += fmt.Sprintf(" AND date >= $%d", paramCount)
        params = append(params, startDate)
        paramCount++
    }
    if endDate := queryParams.Get("end_date"); endDate != "" {
        query += fmt.Sprintf(" AND date <= $%d", paramCount)
        params = append(params, endDate)
        paramCount++
    }

    // Add sorting
    query += " ORDER BY date DESC"

    // Execute the query
    rows, err := h.db.Query(query, params...)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    // Scan the results
    var transactions []models.Transaction
    for rows.Next() {
        var t models.Transaction
        err := rows.Scan(
            &t.ID,
            &t.Amount,
            &t.Type,
            &t.Category,
            &t.Description,
            &t.Date,
            &t.CreatedAt,
        )
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        transactions = append(transactions, t)
    }

    if err = rows.Err(); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(transactions)
}

func (h *TransactionHandler) GetTransaction(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.ParseInt(vars["id"], 10, 64)
    if err != nil {
        http.Error(w, "Invalid transaction ID", http.StatusBadRequest)
        return
    }

    var trans models.Transaction
    err = h.db.QueryRow(`
        SELECT id, amount, type, category, description, date, created_at 
        FROM transactions 
        WHERE id = $1`,
        id,
    ).Scan(
        &trans.ID,
        &trans.Amount,
        &trans.Type,
        &trans.Category,
        &trans.Description,
        &trans.Date,
        &trans.CreatedAt,
    )

    if err == sql.ErrNoRows {
        http.Error(w, "Transaction not found", http.StatusNotFound)
        return
    } else if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    json.NewEncoder(w).Encode(trans)
}

func (h *TransactionHandler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.ParseInt(vars["id"], 10, 64)
    if err != nil {
        http.Error(w, "Invalid transaction ID", http.StatusBadRequest)
        return
    }

    var trans models.Transaction
    if err := json.NewDecoder(r.Body).Decode(&trans); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    result, err := h.db.Exec(`
        UPDATE transactions 
        SET amount = $1, type = $2, category = $3, description = $4, date = $5
        WHERE id = $6`,
        trans.Amount,
        trans.Type,
        trans.Category,
        trans.Description,
        trans.Date,
        id,
    )

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if rowsAffected == 0 {
        http.Error(w, "Transaction not found", http.StatusNotFound)
        return
    }

    // Return the updated transaction
    h.GetTransaction(w, r)
}

func (h *TransactionHandler) DeleteTransaction(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id, err := strconv.ParseInt(vars["id"], 10, 64)
    if err != nil {
        http.Error(w, "Invalid transaction ID", http.StatusBadRequest)
        return
    }

    result, err := h.db.Exec("DELETE FROM transactions WHERE id = $1", id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    if rowsAffected == 0 {
        http.Error(w, "Transaction not found", http.StatusNotFound)
        return
    }

    w.WriteHeader(http.StatusNoContent)
}

func (h *TransactionHandler) GetMonthlyReport(w http.ResponseWriter, r *http.Request) {
	rows, err := h.db.Query(`
		SELECT to_char(date, 'YYYY-MM') AS month,
			SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
			SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses
		FROM transactions
		GROUP BY month
		ORDER BY month DESC`)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var reports []models.MonthlyReport
	for rows.Next() {
		var r models.MonthlyReport
		err := rows.Scan(&r.Month, &r.TotalIncome, &r.TotalExpenses)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		r.NetAmount = r.TotalIncome - r.TotalExpenses
		reports = append(reports, r)
	}

	if err = rows.Err(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(reports)
}