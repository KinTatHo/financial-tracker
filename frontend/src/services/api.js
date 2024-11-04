const API_URL = 'http://localhost:8080';

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString();
};

export const api = {
    async createTransaction(data) {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: defaultHeaders,
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getTransactions() {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'GET',
                headers: defaultHeaders,
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async deleteTransaction(id) {
        try {
            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE',
                headers: defaultHeaders,
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP error! status: ${response.status}`);
            }

            if (response.status === 204) {
                return true;
            }

            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async updateTransaction(id, data) {
        try {

            const formattedData = {
                ...data,
                date: formatDate(data.date)
            };

            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'PUT',
                headers: defaultHeaders,
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getCategories() {
        try {
            const response = await fetch(`${API_URL}/categories`, {
                method: 'GET',
                headers: defaultHeaders,
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || `HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async getMonthlyReport() {
        try {
            const response = await fetch(`${API_URL}/transactions/monthly`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};