import React, { useState } from 'react'
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next'

function OrderConfirm({ isOpen, onClose, onAddMore, onConfirmOrder, allOrders, eventTitle, onEditOrder, onDeleteOrder }) {

  const { t } = useTranslation();

  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const nextOrder = () => {
    setCurrentOrderIndex((prev) => 
      prev === allOrders.length - 1 ? 0 : prev + 1
    );
  };

  const prevOrder = () => {
    setCurrentOrderIndex((prev) => 
      prev === 0 ? allOrders.length - 1 : prev - 1
    );
  };

  const goToOrder = (index) => {
    setCurrentOrderIndex(index);
  };

  if (!isOpen || !allOrders || allOrders.length === 0) return null;
  const currentOrder = allOrders[currentOrderIndex];


  return (
    <div 
      className='fixed inset-0 flex items-center justify-center px-4'
      style={{ 
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className='bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold'
          style={{ 
            backgroundColor: 'transparent',
            border: 'none'
           }}
        >
          ×
        </button>

        <div className='text-center mb-8'>
          <h2 className='text-black text-3xl mb-4 font-semibold'>Order Details</h2>
          <h3 className='text-black text-2xl font-semibold'>
            {eventTitle}
          </h3>
        </div>



        {/* Current Order Details */}
        <div className='mx-auto px-15'>
          <div className='border-2 border-gray-300 rounded-lg p-6 mb-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-bold text-gray-800'>
                {currentOrderIndex + 1}.
              </h3>
              <div className='flex space-x-2'>
                <button
                  onClick={() => onEditOrder(currentOrderIndex)}
                  className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-all duration-200'
                  style={{backgroundColor: '#e51f4b'}}
                >
                  {t('order.Edit')}
                </button>
                {allOrders.length > 1 && (
                  <button
                    onClick={() => {
                      onDeleteOrder(currentOrderIndex);
                      if (currentOrderIndex >= allOrders.length - 1) {
                        setCurrentOrderIndex(Math.max(0, allOrders.length - 2));
                      }
                    }}
                    className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-all duration-200'
                  >
                    {t('order.Delete')}
                  </button>
                )}
              </div>
            </div>

            <div className='space-y-4'>
              {/* Name */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.UserName')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.userName || 'Not provided'}</span>
              </div>

              {/* Facebook Name */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.FacebookName')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.facebookName || 'Not provided'}</span>
              </div>

              {/* Member Code */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.MemberCode')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.memberCode || '-'}</span>
              </div>

              {/* Priority Date */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.PriorityDate')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.priorityDate || 'Not selected'}</span>
              </div>

              {/* 1st Priority Ticket */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.FirstPriorityTicket')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.firstPriorityTicket || '-'}</span>
              </div>

              {/* 2nd Priority Ticket */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.SecondPriorityTicket')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.secondPriorityTicket || '-'}</span>
              </div>

              {/* 3rd Priority Ticket */}
              <div className='flex items-center py-2'>
                <span className='text-xl font-medium text-gray-700 w-1/2 text-right pr-10'>{t('order.ThirdPriorityTicket')}</span>
                <span className='text-xl text-gray-900 font-medium w-1/2'>{currentOrder.thirdPriorityTicket || '-'}</span>
              </div>
            </div>
          </div>

        {/* Order Navigation - Only show if multiple orders */}
        {allOrders.length > 1 && (
            <div className='flex items-center justify-center mb-6'>
            <button
            onClick={prevOrder}
            className='p-2 rounded-full hover:bg-gray-100 transition duration-200 text-black border-none outline-none'
            style={{ background:'transparent' }}
            >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
            </button>

            <div className='flex items-center gap-3 mx-6'>
            {allOrders.map((_, index) => {
                const active = currentOrderIndex === index;
                return (
                <button
                    key={index}
                    onClick={() => goToOrder(index)}
                    className='p-0 m-0 border-none bg-transparent outline-none focus:outline-none'
                    style={{
                        backgroundColor: 'transparent'
                    }}
                >
                    <span
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ${
                        active ? 'bg-pink-500 scale-110' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    />
                </button>
                );
            })}
            </div>

        <button
        onClick={nextOrder}
        className='p-2 rounded-full hover:bg-gray-100 transition duration-200 text-black border-none outline-none'
        style={{ background:'transparent' }}
        >
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
        </svg>
        </button>
         </div>
        )}    


          {/* Action Buttons */}
        <div className='flex gap-15 justify-center mt-4'>
          <button
            onClick={()=>setShowPrompt(true)}
            className='min-h-[65px] min-w-[170px] px-10 py-4 text-white rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 transition mr-5'
            style={{ background:'#e51f4b' }}>
            {t('order.Confirm')}
          </button>
          <button
            onClick={onAddMore}
            className='min-h-[65px] min-w-[170px] px-10 py-4 text-white rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 transition'
            style={{ background:'#e51f4b' }}>
            {t('order.AddMore')}
          </button>
        </div>

        {showPrompt && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg'>
            <div className='bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm shadow-lg'>
              <p className='text-lg font-semibold text-center mb-6 text-black'>{t('order.Confirm')} ?</p>
              <div className='flex gap-4'>
                <button
                  onClick={()=>{ setShowPrompt(false); onConfirmOrder(); }}
                  className='flex-1 py-3 rounded-md text-black font-medium hover:opacity-90'
                  style={{ backgroundColor: 'white', border: '1px solid' }}
                  >
                  Yes
                </button>
                <button
                  onClick={()=>setShowPrompt(false)}
                  className='flex-1 py-3 rounded-md text-black font-medium border border-gray-300 hover:bg-gray-50'
                  style={{ backgroundColor: 'white', border: '1px solid' }}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

}

export default OrderConfirm