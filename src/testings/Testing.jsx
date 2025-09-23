import React, { useEffect, useState } from 'react'

function Testing() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/events/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            return response.json();
        })
        .then(data => {
            setEvents(data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setError(error.message);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 bg-gray-50 mt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-64 bg-red-50 rounded-lg p-8 mt-20 mx-4">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Events</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl mt-20">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                    🎫 Event Listings
                </h1>
                <p className="text-xl text-gray-600">Discover amazing events happening near you</p>
            </div>
            
            {events.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-8xl mb-4">🎪</div>
                    <h3 className="text-2xl font-semibold text-gray-700 mb-2">No events available</h3>
                    <p className="text-gray-500">Check back later for new events!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                            {/* Event Image */}
                            <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500">
                                {event.event_image ? (
                                    <img 
                                        src={event.event_image} 
                                        alt={event.event_name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-white">
                                        <span className="text-4xl mb-2">🎪</span>
                                        <p className="text-lg font-medium">No Image</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Event Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
                                    {event.event_name || 'Untitled Event'}
                                </h3>
                                
                                {/* Event Details */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-3">📅</span>
                                        <span className="font-medium mr-2">Date:</span>
                                        <span className="text-gray-700">
                                            {event.event_date || 'Date TBA'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-3">⏰</span>
                                        <span className="font-medium mr-2">Time:</span>
                                        <span className="text-gray-700">
                                            {event.event_time || 'Time TBA'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-3">📍</span>
                                        <span className="font-medium mr-2">Location:</span>
                                        <span className="text-gray-700 truncate">
                                            {event.event_location || 'Location TBA'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-3">🏷️</span>
                                        <span className="font-medium mr-2">Category:</span>
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                            {event.event_category || 'General'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-3">🎟️</span>
                                        <span className="font-medium mr-2">Sale Date:</span>
                                        <span className="text-gray-700">
                                            {event.sale_date || 'Available Now'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500">Price</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {event.ticket_price ? `$${event.ticket_price}` : 'Price TBA'}
                                        </span>
                                    </div>
                                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg">
                                        Buy Tickets
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Testing