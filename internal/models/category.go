package models

type Category struct {
    ID   int64  `json:"id"`
    Name string `json:"name"`
    Type TransactionType `json:"type"`
}