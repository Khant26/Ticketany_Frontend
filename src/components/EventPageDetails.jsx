import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import BP1 from '../assets/BP1.jpg'
import BP2 from '../assets/BP2.jpeg'
import BP3 from '../assets/BP3.jpg'
import BP4 from '../assets/BP4.jpg'
import NT1 from '../assets/NT1.jpg'
import NT2 from '../assets/NT2.jpg'
import NT3 from '../assets/NT3.jpeg'
import NT4 from '../assets/NT4.jpeg'
import { Link, useParams } from 'react-router'
import guide from '../assets/guideplaceholder.jpg'
import OrderForm from './OrderForm'

function EventPageDetails() {
  const { t } = useTranslation();

  let { id } = useParams();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const [eventDetails, setEventDetails] = useState([
    {id: 1, 
    Title: "BlackPink Happy Tour",
    Date: "12 Sep 2025, 13 Sep 2025, 14 Sep 2025, 15 Sep 2025", 
    Time: "20:00 - 22:00 PM", 
    Location: "Building 17, Rangsit University", 
    Sale: "1 July 2025 - 2 September 2025", 
    Price: "1799THB 2799THB  799THB 931THB 812THB 1734THB 1755THB 1777THB   ",
    description: "BlackPink concert featuring their greatest hits.",
    images: [
      BP1,
      BP2,
      BP3,
      BP4
    ],
  },

    {id: 2, 
    Title: "Naytoe", 
    Date: "20 Oct 2025, 21 Oct 2025, 22 Oct 2025", 
    Time: "19:00 - 21:30 PM", 
    Location: "Icon Siam", 
    Sale: "15 August 2025 - 10 October 2025", 
    Price: "2500THB , 2500THB , 1700THB,  3000THB, 1560THB, 4650THB, 2500THB , 2500THB , 1700THB,  3000THB, 1560THB, 4650THB",
    description: "Ko Nay Ko Toe",
    images: [
      NT1,
      NT2,
      NT3,
      NT4
    ],
  }]);

  if (id > 2) {
  return <div className='text-black'>{t('generic.noEvent')}</div>;
  }

  const eventDetail = eventDetails.find(event => event.id === parseInt(id)) || eventDetails[0];


  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === eventDetail.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? eventDetail.images.length - 1 : prev - 1
    );
  };

return (
   <>
  <div className='mt-16 lg:mb-10 lg:px-100 md:mt-24 px-4 md:px-8 py-6 relative z-10 lg:w-500'> {/* Added border */}
    
    <div className='max-w-7xl mx-auto border-2 border-gray-200 shadow-md'>
      <div className='flex flex-col lg:flex-row items-center justify-center bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]'> {/* Fixed minimum height */}
        
        {/* Left side - Image Carousel */}
        <div className='w-full lg:w-2/5 relative md:p-6 lg:p-0 lg:pb-10'>
          <img 
            src={eventDetail.images[currentImageIndex]} 
            alt={`${eventDetail.title} - Image ${currentImageIndex + 1}`}
            className='w-full h-64 md:h-80 lg:h-150 object-cover rounded-lg'
          />
          
          {/* Previous Arrow */} 
          <div className="mt-4 flex items-center justify-center gap-5">
            {/* Prev */}
            <button
              onClick={prevImage}
              className="p-2 rounded-full bg-black/60 text-black hover:bg-black/80 transition-colors focus:outline-none"
              aria-label="Previous image"
              style={{ backgroundColor: 'transparent', border: 'none'}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="flex items-center gap-3">
              {eventDetail.images.map((_, index) => {
                const active = currentImageIndex === index
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
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
                )
              })}
            </div>

            {/* Next */}
            <button
              onClick={nextImage}
              className="p-2 rounded-full bg-black/60 text-black hover:bg-black/80 transition-colors focus:outline-none"
              aria-label="Next image"
              style={{ backgroundColor: 'transparent', border: 'none'}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>  
        </div>
        
        {/* Right side - Event Details */}
        <div className='w-full lg:w-3/5 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8 flex mb-20 flex-col justify-between min-h-[500px]'> {/* Removed all top padding */}
          {/* Move title outside of flex-1 wrapper */}
          <h3 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-6'>{eventDetail.Title}</h3>
          
          {/* Content wrapper - now starts after title */}
          <div className='flex-1'>           
            <div className='space-y-4 md:space-y-5'>
              <div className='flex items-start mb-7'>
                <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.date')}</span>
                <span className='text-lg md:text-lg text-black font-semibold ml-4'>{eventDetail.Date}</span>
              </div>

              <div className='flex items-start mb-7'>
                <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.time')}</span>
                <span className='text-lg md:text-lg text-black font-semibold ml-4'>{eventDetail.Time}</span>
              </div>

              <div className='flex items-start mb-7'>
                <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.location')}</span>
                <span className='text-lg md:text-lg text-black font-semibold ml-4'>{eventDetail.Location}</span>
              </div>

              <div className='flex items-start mb-7'>
                <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.sale')}</span>
                <span className='text-lg md:text-lg text-black font-semibold ml-4'>{eventDetail.Sale}</span>
              </div>

              <div className='flex items-start'>
                <span className='text-lg md:text-lg text-black font-semibold min-w-[80px]'>{t('event.price')}</span>
                <span className='text-lg md:text-lg text-black font-semibold ml-4 break-words line-clamp-2'>{eventDetail.Price}</span>
              </div>
            </div>
          </div>
          
          {/* Bottom section - always at bottom */}
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
    eventTitle={eventDetail.Title}
    eventDates={eventDetail.Date}
    eventTime={eventDetail.Time}
    eventLocation={eventDetail.Location}
    eventImage={eventDetail.images[0]}
  />

 </>
)
}

export default EventPageDetails