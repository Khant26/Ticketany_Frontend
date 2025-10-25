// API Configuration
// Replace these with your actual service account credentials

export const API_CONFIG = {
    baseURL: 'http://127.0.0.1:8000/api',
    
    // Service account credentials for backend authentication
    // These should be admin/service credentials, not user credentials
    serviceAccount: {
        email: 'admin@ticketanywhere.com', // Replace with your service email
        password: 'your-service-password'   // Replace with your service password
    },
    
    // API endpoints
    endpoints: {
        auth: {
            login: '/auth/login/',
            profile: '/user/profile/'
        },
        orders: {
            list: '/orders/',
            detail: '/orders/{id}/',
            search: '/orders/search/',
            stats: '/orders/stats/',
            userOrders: '/users/{userId}/orders/',
            tickets: '/orders/{orderId}/tickets/'
        },
        tickets: {
            list: '/tickets/',
            detail: '/tickets/{id}/'
        }
    },
    
    // Request configuration
    timeout: 10000, // 10 seconds
    retryAttempts: 3
};

// Helper function to get API endpoint URL
export const getApiUrl = (endpoint) => {
    return `${API_CONFIG.baseURL}${endpoint}`;
};

// Helper function to replace path parameters
export const buildEndpoint = (template, params = {}) => {
    let endpoint = template;
    Object.keys(params).forEach(key => {
        endpoint = endpoint.replace(`{${key}}`, params[key]);
    });
    return endpoint;
};