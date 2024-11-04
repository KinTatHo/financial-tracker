package handlers

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "github.com/kintatho/financial-tracker/internal/models"
)

type CategoryHandler struct {
    db *sql.DB
}

func NewCategoryHandler(db *sql.DB) *CategoryHandler {
    return &CategoryHandler{db: db}
}

func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
    rows, err := h.db.Query("SELECT id, name, type FROM categories ORDER BY type, name")
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    var categories []models.Category
    for rows.Next() {
        var c models.Category
        err := rows.Scan(&c.ID, &c.Name, &c.Type)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        categories = append(categories, c)
    }

    json.NewEncoder(w).Encode(categories)
}

func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
    var category models.Category
    if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    // Validate category type
    if category.Type != models.Income && category.Type != models.Expense {
        http.Error(w, "Invalid category type. Must be 'income' or 'expense'", http.StatusBadRequest)
        return
    }

    err := h.db.QueryRow(`
        INSERT INTO categories (name, type)
        VALUES ($1, $2)
        RETURNING id`,
        category.Name,
        category.Type,
    ).Scan(&category.ID)

    if err != nil {
        // Check for duplicate category
        if err.Error() == `pq: duplicate key value violates unique constraint "categories_name_type_key"` {
            http.Error(w, "Category already exists", http.StatusConflict)
            return
        }
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(category)
}
