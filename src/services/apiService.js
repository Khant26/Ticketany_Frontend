import { API_CONFIG, buildEndpoint } from "../config/api";
import { authFetch } from "./apiClient";

class ApiService {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        // User-side app: token comes from user login (localStorage)
    }

    // Backwards compatible no-op (older hooks call these)
    async authenticate() {
        return { success: true };
    }

    setCredentials() {
        // no-op in user app
    }

    async ensureAuthenticated() {
        // no-op: authFetch reads token from localStorage
        return true;
    }

    // Convenience methods for common HTTP verbs
    async get(endpoint) {
        const result = await this.apiRequest(endpoint, { method: 'GET' });
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch data');
        }
    }

    async post(endpoint, data) {
        const result = await this.apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to post data');
        }
    }

    async patch(endpoint, data) {
        const result = await this.apiRequest(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to patch data');
        }
    }

    async put(endpoint, data) {
        const result = await this.apiRequest(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to put data');
        }
    }

    async delete(endpoint) {
        const result = await this.apiRequest(endpoint, { method: 'DELETE' });
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to delete data');
        }
    }

    // Generic API request with authentication
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await authFetch(endpoint, {
                auth: true,
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async handleResponse(response) {
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, data };
        } else {
            return { 
                success: false, 
                error: data.error || data.detail || data.message || 'Request failed',
                status: response.status 
            };
        }
    }

    // Fetch all orders
    async fetchOrders(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const endpoint = `/orders/${queryParams ? `?${queryParams}` : ''}`;
            
            const result = await this.apiRequest(endpoint);
            
            if (result.success) {
                return { success: true, orders: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            return { success: false, error: 'Failed to fetch orders' };
        }
    }

    // Fetch specific order by ID
    async fetchOrderById(orderId) {
        try {
            const result = await this.apiRequest(`/orders/${orderId}/`);
            
            if (result.success) {
                return { success: true, order: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            return { success: false, error: 'Failed to fetch order' };
        }
    }

    // Fetch all tickets
    async fetchTickets(filters = {}) {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const endpoint = `/tickets/${queryParams ? `?${queryParams}` : ''}`;
            
            const result = await this.apiRequest(endpoint);
            
            if (result.success) {
                return { success: true, tickets: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
            return { success: false, error: 'Failed to fetch tickets' };
        }
    }

    // Fetch tickets for a specific order
    async fetchTicketsByOrder(orderId) {
        try {
            const result = await this.apiRequest(`/orders/${orderId}/tickets/`);
            
            if (result.success) {
                return { success: true, tickets: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error fetching order tickets:', error);
            return { success: false, error: 'Failed to fetch order tickets' };
        }
    }

    // Fetch user orders (if user-specific endpoint exists)
    async fetchUserOrders(userId) {
        try {
            // Backend in this project doesn't expose /users/{id}/orders/; keep method for compatibility.
            const endpoint = buildEndpoint(API_CONFIG.endpoints.orders.userOrders, { userId });
            const result = await this.apiRequest(endpoint);
            
            if (result.success) {
                return { success: true, orders: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error fetching user orders:', error);
            return { success: false, error: 'Failed to fetch user orders' };
        }
    }

    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            const result = await this.apiRequest(`/orders/${orderId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            
            if (result.success) {
                return { success: true, order: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: 'Failed to update order status' };
        }
    }

    // Update ticket status
    async updateTicketStatus(ticketId, status) {
        try {
            const result = await this.apiRequest(`/tickets/${ticketId}/`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            
            if (result.success) {
                return { success: true, ticket: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error updating ticket status:', error);
            return { success: false, error: 'Failed to update ticket status' };
        }
    }

    // Search orders
    async searchOrders(searchTerm) {
        try {
            const result = await this.apiRequest(`/orders/search/?q=${encodeURIComponent(searchTerm)}`);
            
            if (result.success) {
                return { success: true, orders: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error searching orders:', error);
            return { success: false, error: 'Failed to search orders' };
        }
    }

    // Get order statistics
    async getOrderStats() {
        try {
            const result = await this.apiRequest('/orders/stats/');
            
            if (result.success) {
                return { success: true, stats: result.data };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Error fetching order stats:', error);
            return { success: false, error: 'Failed to fetch order stats' };
        }
    }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;