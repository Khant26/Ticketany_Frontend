import React, { useState, useRef } from 'react'
import OrderConfirm from './OrderConfirm';
import OrderComplete from './OrderComplete';
import { useTranslation } from 'react-i18next'

function OrderForm({ isOpen, onClose, eventTitle, eventDates, eventTime, eventLocation, eventImage }) {

  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    userName: '',
    facebookName: '',
    memberCode: '',
    priorityDate: '',
    firstPriorityTicket: '',
    secondPriorityTicket: '',
    thirdPriorityTicket: ''
  });
  
  const [allOrders, setAllOrders] = useState([]);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(null);
  
  const [showOrderComplete, setShowOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const orderCounterRef = useRef(0); 
  const ORDER_ID_LENGTH = 5; 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      facebookName: '',
      memberCode: '',
      priorityDate: '',
      firstPriorityTicket: '',
      secondPriorityTicket: '',
      thirdPriorityTicket: ''
    });
    setIsEditingOrder(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order form submitted:', formData);
    
    if (isEditingOrder !== null) {
      // Edit existing order
      const updatedOrders = [...allOrders];
      updatedOrders[isEditingOrder] = { ...formData, id: Date.now() };
      setAllOrders(updatedOrders);
    } else {
      // Add new order
      const newOrder = { ...formData, id: Date.now() };
      setAllOrders([...allOrders, newOrder]);
    }
    
    setShowOrderConfirm(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
      resetForm();
      setAllOrders([]);
    }
  };

  const handleConfirmClose = () => {
    setShowOrderConfirm(false);
  };

  const handleAddMore = () => {
    setShowOrderConfirm(false);
    resetForm();
    // Form stays open for adding another order
  };

  const handleEditOrder = (index) => {
    const orderToEdit = allOrders[index];
    setFormData(orderToEdit);
    setIsEditingOrder(index);
    setShowOrderConfirm(false);
  };

  const handleDeleteOrder = (index) => {
    const updatedOrders = allOrders.filter((_, i) => i !== index);
    setAllOrders(updatedOrders);
  };

  const handleConfirmOrder = () => {
    // user clicked Yes in confirmation prompt
    orderCounterRef.current += 1;
    const id = orderCounterRef.current.toString().padStart(ORDER_ID_LENGTH, '0');
    setOrderId(id);
    setShowOrderConfirm(false);
    setShowOrderComplete(true);
  };

  const handleCloseComplete = () => {
    setShowOrderComplete(false);
    // optionally clear orders or leave them
    setAllOrders([]);
    resetForm();
    onClose();
  };
  // Determine overall visibility: keep component mounted if confirm/complete modals are active
  const anyOpen = isOpen || showOrderConfirm || showOrderComplete;
  const formVisible = isOpen && !showOrderConfirm && !showOrderComplete;
  if (!anyOpen) return null;

  const parseDates = (dateString) => {
    if (!dateString) return [];
    return dateString.split(',').map(date => date.trim()).filter(date => date.length > 0);
  };
  const availableDates = parseDates(eventDates);

  return (
    <>
    {formVisible && (
      <div 
        className='fixed inset-0 flex items-center justify-center px-4'
        style={{ 
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
        onClick={handleBackdropClick}
      >
        <div 
          className='bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl relative max-h-[95vh] overflow-y-auto'
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={() => {
              onClose();
              resetForm();
              setAllOrders([]);
            }}
            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold'
            style={{ 
              backgroundColor: 'transparent',
              border: 'none'
             }}
          >
            ×
          </button>

          <div className='text-center mb-8'>
            <p className='text-black text-3xl mb-3 font-bold'>
              {isEditingOrder !== null ? t('order.EditFormTitle') : t('order.FillFormTitle')}
            </p>
            {allOrders.length > 0 && (
              <p className='text-gray-600 text-lg'>
                {isEditingOrder !== null ? 
                  `${t('order.EditingOrder')} #${isEditingOrder + 1}`
                  : t('order.addedOrders', { count: allOrders.length })}

              </p>
            )}
          </div>

          {/* Form container with left/right margins */}
          <div className='max-w-4xl mx-auto px-8'>
            <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Event Title (Read-only) */}
            <div className='flex items-center min-h-[60px]'>
              <span className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.Event')}
              </span>
              <span className='block text-lg font-medium text-gray-700 ml-8'>
                {eventTitle}
              </span>
            </div>

            {/* User Name */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='userName' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.UserName')}
              </label>
              <input
                type='text'
                id='userName'
                name='userName'
                value={formData.userName}
                onChange={handleChange}
                className='flex-1 text-gray-600 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
                placeholder={t('place.UserName')}
                required
              />
            </div>

            {/* Facebook Name */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='facebookName' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.FacebookName')}
              </label>
              <input
                type='text'
                id='facebookName'
                name='facebookName'
                value={formData.facebookName}
                onChange={handleChange}
                className='flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
                placeholder={t('place.FacebookName')}
                required
              />
            </div>

            {/* Member Code */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='memberCode' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.MemberCode')}
              </label>
              <input
                type='text'
                id='memberCode'
                name='memberCode'
                value={formData.memberCode}
                onChange={handleChange}
                className='flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
                placeholder={t('place.MemberCode')}
              />
            </div>

            {/* Priority Date */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='priorityDate' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.PriorityDate')}
              </label>
              <select
                id='priorityDate'
                name='priorityDate'
                value={formData.priorityDate}
                onChange={handleChange}
                className='flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
              >
                <option value=''>{t('select.PriorityDate')}</option>
                {availableDates.map((date, index) => (
                  <option key={index} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {/* 1st Priority Ticket */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='firstPriorityTicket' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.FirstPriorityTicket')}
              </label>
              <select
                id='firstPriorityTicket'
                name='firstPriorityTicket'
                value={formData.firstPriorityTicket}
                onChange={handleChange}
                className='flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
                required
              >
                <option value=''>{t('select.1stPriorityTicket')}</option>
                <option value='VIP'>VIP - 2799THB</option>
                <option value='Premium'>Premium - 1799THB</option>
                <option value='Standard'>Standard - 799THB</option>
              </select>
            </div>

            {/* 2nd Priority Ticket */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='secondPriorityTicket' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.SecondPriorityTicket')}
              </label>
              <select
                id='secondPriorityTicket'
                name='secondPriorityTicket'
                value={formData.secondPriorityTicket}
                onChange={handleChange}
                className='flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
              >
                <option value=''>{t('select.2ndPriorityTicket')}</option>
                <option value='VIP'>VIP - 2799THB</option>
                <option value='Premium'>Premium - 1799THB</option>
                <option value='Standard'>Standard - 799THB</option>
              </select>
            </div>

            {/* 3rd Priority Ticket */}
            <div className='flex items-center min-h-[60px]'>
              <label htmlFor='thirdPriorityTicket' className='block text-lg font-medium text-gray-700 min-w-[180px]'>
                {t('order.ThirdPriorityTicket')}
              </label>
              <select
                id='thirdPriorityTicket'
                name='thirdPriorityTicket'
                value={formData.thirdPriorityTicket}
                onChange={handleChange}
                className='flex-1 px-4 py-3 border text-gray-600 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ml-8'
              >
                <option value=''>{t('select.3rdPriorityTicket')}</option>
                <option value='VIP'>VIP - 2799THB</option>
                <option value='Premium'>Premium - 1799THB</option>
                <option value='Standard'>Standard - 799THB</option>
              </select>
            </div>

              {/* Submit Button */}
              <div className='flex justify-center mt-10'>
                <button
                  type='submit'
                  className='w-1/2 text-white py-4 px-8 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 text-lg'
                  style={{ backgroundColor: '#feb1c3' }}
                >
                  {isEditingOrder !== null ? 'Update Order' : 'Next'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

  <OrderConfirm
        isOpen={showOrderConfirm}
        onClose={handleConfirmClose}
        onAddMore={handleAddMore}
        onConfirmOrder={handleConfirmOrder}
        allOrders={allOrders}
        eventTitle={eventTitle}
        onEditOrder={handleEditOrder}
        onDeleteOrder={handleDeleteOrder}
      />

  <OrderComplete
        isOpen={showOrderComplete}
        onClose={handleCloseComplete}
        eventTitle={eventTitle}
        allOrders={allOrders}
        orderId={orderId}
      />
    </>
  )
}

export default OrderForm