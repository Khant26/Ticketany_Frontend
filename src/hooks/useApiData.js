import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

export const useOrdersData = (autoFetch = true) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Initialize the service (user-side): ensure access_token exists
    const initializeService = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            const msg = 'Not logged in. Please sign in first.';
            setError(msg);
            setInitialized(false);
            return { success: false, error: msg };
        }
        setInitialized(true);
        setError(null);
        return { success: true };
    }, []);

    // Fetch orders
    const fetchOrders = useCallback(async (filters = {}) => {
        if (!initialized) {
            setError('Service not initialized. Call initializeService first.');
            return { success: false, error: 'Service not initialized' };
        }

        setLoading(true);
        setError(null);

        try {
            const result = await apiService.fetchOrders(filters);
            
            if (result.success) {
                setOrders(result.orders);
                return { success: true, orders: result.orders };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMsg = 'Failed to fetch orders';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Fetch specific order
    const fetchOrderById = useCallback(async (orderId) => {
        if (!initialized) {
            return { success: false, error: 'Service not initialized' };
        }

        setLoading(true);
        try {
            const result = await apiService.fetchOrderById(orderId);
            return result;
        } catch (err) {
            return { success: false, error: 'Failed to fetch order' };
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Update order status
    const updateOrderStatus = useCallback(async (orderId, status) => {
        if (!initialized) {
            return { success: false, error: 'Service not initialized' };
        }

        try {
            const result = await apiService.updateOrderStatus(orderId, status);
            
            if (result.success) {
                // Update local state
                setOrders(prevOrders => 
                    prevOrders.map(order => 
                        order.id === orderId 
                            ? { ...order, status: status }
                            : order
                    )
                );
            }
            
            return result;
        } catch (err) {
            return { success: false, error: 'Failed to update order status' };
        }
    }, [initialized]);

    // Search orders
    const searchOrders = useCallback(async (searchTerm) => {
        if (!initialized) {
            return { success: false, error: 'Service not initialized' };
        }

        setLoading(true);
        try {
            const result = await apiService.searchOrders(searchTerm);
            
            if (result.success) {
                setOrders(result.orders);
            }
            
            return result;
        } catch (err) {
            return { success: false, error: 'Failed to search orders' };
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Auto-fetch orders when service is initialized
    useEffect(() => {
        if (initialized && autoFetch) {
            fetchOrders();
        }
    }, [initialized, autoFetch, fetchOrders]);

    return {
        orders,
        loading,
        error,
        initialized,
        initializeService,
        fetchOrders,
        fetchOrderById,
        updateOrderStatus,
        searchOrders,
        setOrders
    };
};

export const useTicketsData = (autoFetch = true) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Initialize the service (user-side): ensure access_token exists
    const initializeService = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            const msg = 'Not logged in. Please sign in first.';
            setError(msg);
            setInitialized(false);
            return { success: false, error: msg };
        }
        setInitialized(true);
        setError(null);
        return { success: true };
    }, []);

    // Fetch tickets
    const fetchTickets = useCallback(async (filters = {}) => {
        if (!initialized) {
            setError('Service not initialized. Call initializeService first.');
            return { success: false, error: 'Service not initialized' };
        }

        setLoading(true);
        setError(null);

        try {
            const result = await apiService.fetchTickets(filters);
            
            if (result.success) {
                setTickets(result.tickets);
                return { success: true, tickets: result.tickets };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMsg = 'Failed to fetch tickets';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Fetch tickets for specific order
    const fetchTicketsByOrder = useCallback(async (orderId) => {
        if (!initialized) {
            return { success: false, error: 'Service not initialized' };
        }

        setLoading(true);
        try {
            const result = await apiService.fetchTicketsByOrder(orderId);
            return result;
        } catch (err) {
            return { success: false, error: 'Failed to fetch order tickets' };
        } finally {
            setLoading(false);
        }
    }, [initialized]);

    // Update ticket status
    const updateTicketStatus = useCallback(async (ticketId, status) => {
        if (!initialized) {
            return { success: false, error: 'Service not initialized' };
        }

        try {
            const result = await apiService.updateTicketStatus(ticketId, status);
            
            if (result.success) {
                // Update local state
                setTickets(prevTickets => 
                    prevTickets.map(ticket => 
                        ticket.id === ticketId 
                            ? { ...ticket, status: status }
                            : ticket
                    )
                );
            }
            
            return result;
        } catch (err) {
            return { success: false, error: 'Failed to update ticket status' };
        }
    }, [initialized]);

    // Auto-fetch tickets when service is initialized
    useEffect(() => {
        if (initialized && autoFetch) {
            fetchTickets();
        }
    }, [initialized, autoFetch, fetchTickets]);

    return {
        tickets,
        loading,
        error,
        initialized,
        initializeService,
        fetchTickets,
        fetchTicketsByOrder,
        updateTicketStatus,
        setTickets
    };
};