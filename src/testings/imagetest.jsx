import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import guide from '../assets/guideplaceholder.jpg'
import OrderForm from '../components/OrderForm'

function ImageTest() { // Capitalized component name
  const { t } = useTranslation();
  let { id } = useParams();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [eventDetails, setEventDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/events/');
        if (response.ok) {
          const data = await response.json();
          setEventDetails(data);
          console.log('Fetched events:', data);
          console.log('Looking for ID:', id);
        } else {
          setError('Failed to fetch event details');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Error fetching events: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Helper function to get images array from event
  const getEventImages = (event) => {
    if (!event) return [];
    
    // Use the new images array structure with image_url
    if (event.images && Array.isArray(event.images) && event.images.length > 0) {
      return event.images.map(img => img.image_url).filter(Boolean);
    }
    
    // Check if event has multiple images in event_images array (fallback)
    if (event.event_images && Array.isArray(event.event_images) && event.event_images.length > 0) {
      return event.event_images.map(img => img.data || img.image_url || img);
    }
    // Fallback to single image
    if (event.event_image) {
      return [event.event_image];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Add debugging
  console.log('Event Details:', eventDetails);
  console.log('Current ID from params:', id);
  console.log('Available event IDs:', eventDetails.map(e => e.id));

  const eventDetail = eventDetails.find(event => event.id === parseInt(id));

  console.log('Found event:', eventDetail);

  if (!eventDetail) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-4">
            {eventDetails.length === 0 
              ? 'No events available.' 
              : `Event with ID ${id} not found.`
            }
          </p>
          
          {eventDetails.length > 0 && (
            <div className="mt-6">
              <p className="text-gray-600 mb-4">Available events:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {eventDetails.map(event => (
                  <Link
                    key={event.id}
                    to={`/imagetest/${event.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {event.event_name} (ID: {event.id})
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <Link 
              to="/imagetest"
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to All Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = getEventImages(eventDetail);
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className='mt-16 lg:mb-10 lg:px-100 md:mt-24 px-4 md:px-8 py-6 relative z-10 lg:w-500'>
        <div className='max-w-7xl mx-auto border-2 border-gray-200 shadow-md'>
          <div className='flex flex-col lg:flex-row items-center justify-center bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]'>
            
            {/* Left side - Image Carousel */}
            <div className='w-full lg:w-2/5 relative md:p-6 lg:p-0 lg:pb-10'>
              {images.length > 0 ? (
                <>
                  <img 
                    src={images[currentImageIndex]} 
                    alt={`${eventDetail.event_name} - Image ${currentImageIndex + 1}`}
                    className='w-full h-64 md:h-80 lg:h-150 object-cover rounded-lg'
                    onError={(e) => {
                      console.error('Image failed to load:', images[currentImageIndex]);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  
                  {/* Image Navigation Controls */}
                  {hasMultipleImages && (
                    <div className="mt-4 flex items-center justify-center gap-5">
                      {/* Previous Button */}
                      <button
                        onClick={prevImage}
                        className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-gray-800 hover:text-black transition-colors focus:outline-none"
                        aria-label="Previous image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {/* Dot Indicators */}
                      <div className="flex items-center gap-3">
                        {images.map((_, index) => {
                          const active = currentImageIndex === index;
                          return (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className="p-0 m-0 focus:outline-none"
                              aria-label={`Go to image ${index + 1}`}
                              style={{ backgroundColor: 'transparent', border: 'none' }}
                            >
                              <span
                                className={`block w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                                  active
                                    ? 'bg-pink-500 scale-125 shadow-[0_0_0_4px_rgba(236,87,120,0.35)]'
                                    : 'bg-gray-500 hover:bg-gray-400'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={nextImage}
                        className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-gray-800 hover:text-black transition-colors focus:outline-none"
                        aria-label="Next image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Image Counter */}
                  {hasMultipleImages && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-64 md:h-80 lg:h-150 bg-gray-200 flex items-center justify-center rounded-lg">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right side - Event Details */}
            <div className='w-full lg:w-3/5 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 flex mb-20 flex-col justify-between min-h-[500px]'>
              <h3 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-6'>
                {eventDetail.event_name}
              </h3>
              
              <div className='flex-1'>           
                <div className='space-y-4 md:space-y-5'>
                  <div className='flex items-start mb-7'>
                    <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.date')}</span>
                    <span className='text-lg md:text-lg text-black font-semibold ml-4'>
                      {eventDetail.event_date ? new Date(eventDetail.event_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className='flex items-start mb-7'>
                    <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.time')}</span>
                    <span className='text-lg md:text-lg text-black font-semibold ml-4'>
                      {eventDetail.event_time || 'N/A'}
                    </span>
                  </div>

                  <div className='flex items-start mb-7'>
                    <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.location')}</span>
                    <span className='text-lg md:text-lg text-black font-semibold ml-4'>
                      {eventDetail.event_location || 'N/A'}
                    </span>
                  </div>

                  <div className='flex items-start mb-7'>
                    <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.sale')}</span>
                    <span className='text-lg md:text-lg text-black font-semibold ml-4'>
                      {eventDetail.sale_date ? new Date(eventDetail.sale_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className='flex items-start'>
                    <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.price')}</span>
                    <span className='text-lg md:text-lg text-black font-semibold ml-4 break-words line-clamp-2'>
                      ${eventDetail.ticket_price || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setShowOrderForm(true)}
                className='w-1/2 px-6 md:px-8 py-2 md:py-3 text-white rounded-lg 
                hover:opacity-90 transition-all duration-200 font-semibold text-center' 
                style={{
                  backgroundColor: '#feb1c3',
                  color: 'white'
                }}
              >
                {t('event.orderNow')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='w-300 h-300 object-contain m-auto'>
        <img src={guide} alt="Guide" />
      </div>

      <OrderForm 
        isOpen={showOrderForm}
        onClose={() => setShowOrderForm(false)}
        eventTitle={eventDetail.event_name}
        eventDates={eventDetail.event_date}
        eventTime={eventDetail.event_time}
        eventLocation={eventDetail.event_location}
        eventImage={images[0]}
        eventId={eventDetail?.id}
      />
    </>
  );
}

export default ImageTest; // Capitalized export