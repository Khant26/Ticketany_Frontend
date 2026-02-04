// API Configuration
// Uses environment variables from .env file

export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/',
    
    // Service account credentials for backend authentication
    // These should be admin/service credentials, not user credentials
    serviceAccount: {
        email: import.meta.env.VITE_SERVICE_EMAIL || 'admin@ticketanywhere.com',
        password: import.meta.env.VITE_SERVICE_PASSWORD || 'your-service-password'
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
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
    retryAttempts: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || '3')
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