import React, { useState, useEffect } from 'react';
import { useOrdersData, useTicketsData } from '../hooks/useApiData';

function ApiDataExample() {
    const [serviceEmail, setServiceEmail] = useState('');
    const [servicePassword, setServicePassword] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);

    // Use the API hooks
    const {
        orders,
        loading: ordersLoading,
        error: ordersError,
        initialized: ordersInitialized,
        initializeService: initOrdersService,
        fetchOrders,
        updateOrderStatus
    } = useOrdersData(false);

    const {
        tickets,
        loading: ticketsLoading,
        error: ticketsError,
        initializeService: initTicketsService,
        fetchTickets,
        updateTicketStatus
    } = useTicketsData(false);

    // Configure the service with credentials
    const handleConfigureService = async () => {
        if (!serviceEmail || !servicePassword) {
            alert('Please enter both email and password');
            return;
        }

        // Initialize both hooks with the same credentials
        const ordersResult = await initOrdersService(serviceEmail, servicePassword);
        const ticketsResult = await initTicketsService(serviceEmail, servicePassword);

        if (ordersResult.success && ticketsResult.success) {
            setIsConfigured(true);
            console.log('Service configured successfully');
            
            // Automatically fetch data
            await fetchOrders();
            await fetchTickets();
        } else {
            console.error('Failed to configure service');
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            console.log('Order status updated successfully');
        } else {
            console.error('Failed to update order status:', result.error);
        }
    };

    const handleUpdateTicketStatus = async (ticketId, newStatus) => {
        const result = await updateTicketStatus(ticketId, newStatus);
        if (result.success) {
            console.log('Ticket status updated successfully');
        } else {
            console.error('Failed to update ticket status:', result.error);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">API Service Example</h1>

            {/* Service Configuration */}
            {!isConfigured && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h2 className="text-lg font-semibold mb-4">Configure API Service</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Service Email:</label>
                            <input
                                type="email"
                                value={serviceEmail}
                                onChange={(e) => setServiceEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Service Password:</label>
                            <input
                                type="password"
                                value={servicePassword}
                                onChange={(e) => setServicePassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={handleConfigureService}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Configure Service
                        </button>
                    </div>
                </div>
            )}

            {isConfigured && (
                <>
                    {/* Orders Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Orders</h2>
                            <button
                                onClick={() => fetchOrders()}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                                Refresh
                            </button>
                        </div>

                        {ordersLoading && (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">Loading orders...</p>
                            </div>
                        )}

                        {ordersError && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                                <p className="text-red-600">Error: {ordersError}</p>
                            </div>
                        )}

                        {!ordersLoading && !ordersError && (
                            <div className="space-y-3">
                                {orders.length === 0 ? (
                                    <p className="text-gray-500">No orders found</p>
                                ) : (
                                    orders.map((order, index) => (
                                        <div key={order.id || index} className="border rounded p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">Order #{order.id || order.orderId}</p>
                                                    <p className="text-sm text-gray-600">{order.eventTitle}</p>
                                                    <p className="text-sm">Status: {order.status}</p>
                                                </div>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tickets Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Tickets</h2>
                            <button
                                onClick={() => fetchTickets()}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                                Refresh
                            </button>
                        </div>

                        {ticketsLoading && (
                            <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-gray-600">Loading tickets...</p>
                            </div>
                        )}

                        {ticketsError && (
                            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                                <p className="text-red-600">Error: {ticketsError}</p>
                            </div>
                        )}

                        {!ticketsLoading && !ticketsError && (
                            <div className="space-y-3">
                                {tickets.length === 0 ? (
                                    <p className="text-gray-500">No tickets found</p>
                                ) : (
                                    tickets.map((ticket, index) => (
                                        <div key={ticket.id || index} className="border rounded p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">Ticket #{ticket.id}</p>
                                                    <p className="text-sm text-gray-600">{ticket.userName}</p>
                                                    <p className="text-sm">Status: {ticket.status}</p>
                                                </div>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => handleUpdateTicketStatus(ticket.id, 'used')}
                                                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                    >
                                                        Mark Used
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateTicketStatus(ticket.id, 'cancelled')}
                                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default ApiDataExample;