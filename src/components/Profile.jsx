import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import OrderDetails from './OrderDetails'
import Logo from '../assets/logo.jpg'

function Profile() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('orders')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [orders, setOrders] = useState([])

  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    const savedOrders = localStorage.getItem('userOrders')
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders)
        setOrders(parsed)
      } catch (e) {
        console.error('Error loading orders:', e)
      }
    }
  }, [])

  const openOrderDetails = (orderGroup, ticket) => {
    setSelectedOrder(orderGroup)
    setSelectedTicket(ticket)
    setShowOrderDetails(true)
  }

  const handleSendVerification = () => {
    setVerificationSent(true)
  }

  const handleConfirmPassword = () => {
    setShowChangePassword(false)
    setVerificationSent(false)
  }

  const user = { name: 'HybridDev' }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'border-orange-500 text-orange-600'
      case 'paid':
        return 'border-green-500 text-green-600'
      case 'received':
        return 'border-pink-500 text-pink-600'
      case 'cancelled':
        return 'border-red-500 text-red-600'
      default:
        return 'border-gray-500 text-gray-600'
    }
  }

  const getPrice = (ticket) => {
    if (ticket.firstPriorityTicket?.includes('VIP')) return '2799 THB'
    if (ticket.firstPriorityTicket?.includes('Premium')) return '1799 THB'
    if (ticket.firstPriorityTicket?.includes('Standard')) return '799 THB'
    return '1799 THB'
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Profile */}
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <button className="absolute -bottom-1 -right-1 w-5 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50">
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="
                    text-xl sm:text-2xl font-semibold text-black
                    relative pb-3 pl-1 sm:pl-3
                    after:content-[''] after:absolute after:left-0 after:bottom-0
                    after:h-[2px] after:w-full after:bg-[#e62852]
                  "
                >
                  {user.name}
                </h1>
                <button
                  className="text-gray-600 hover:text-gray-800"
                  style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-white px-4 py-2 rounded-lg hover:bg-pink-300 transition-colors font-medium text-sm w-full sm:w-auto"
                  style={{ backgroundColor: '#feb1c3' }}
                >
                  {t('profile.changePassword')}
                </button>
              </div>
            </div>
          </div>
        

        {/* Main Card */}
        <div className="bg-white rounded-lg mt-10">
          {/* Tabs */}
            <div className="flex flex-wrap items-end px-4 sm:px-8 pt-4 sm:pt-6 gap-6 sm:gap-12 mb-4 sm:mb-8">
              <button
                onClick={() => setActiveTab('orders')}
                className={`
                  relative appearance-none border-none focus:outline-none
                  pb-3 sm:pb-4 px-1 font-medium text-lg sm:!text-2xl text-gray-700 hover:text-gray-900
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:rounded
                  after:transition-colors after:duration-200
                  ${activeTab === 'orders' ? 'after:bg-[#e62852]' : 'after:bg-transparent'}
                `}
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
              >
                {t('profile.myOrders')}
              </button>

              <span aria-hidden="true" className="hidden sm:inline-block relative h-14 w-4">
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#e62852] rotate-[20deg]" />
              </span>

              <button
                onClick={() => setActiveTab('tickets')}
                className={`
                  relative appearance-none border-none focus:outline-none
                  pb-3 sm:pb-4 px-1 font-medium text-lg sm:!text-2xl text-gray-700 hover:text-gray-900
                  after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:rounded
                  after:transition-colors after:duration-200
                  ${activeTab === 'tickets' ? 'after:bg-[#e62852]' : 'after:bg-transparent'}
                `}
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
              >
                {t('profile.myTickets')}
              </button>
            </div>

          <div className="border-b border-[#e62852]" />

          {/* Orders Table */}
          <div className="px-4 sm:px-8 py-4">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-7 gap-6 lg:gap-16 xl:gap-32 py-3 border-b border-[#e62852] min-w-full">
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">{t('profile.id')}</div>
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">{t('profile.event')}</div>
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">{t('profile.name')}</div>
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">{t('profile.facebookName')}</div>
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">{t('profile.memberCode')}</div>
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">{t('profile.price')}</div>
              <div className="font-semibold text-gray-700 text-sm lg:text-lg">Status</div>
            </div>

            <div className="space-y-4 mt-4">
              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No orders found. Create some orders first!
                </div>
              )}

              {orders.map((orderGroup, groupIndex) => (
                <div
                  key={orderGroup.orderId || groupIndex}
                  className="border border-gray-300 md:border-gray-600 rounded-lg p-4 md:p-4"
                >
                  {/* Ticket rows */}
                  {orderGroup.allOrders?.map((ticket, ticketIndex) => {
                    const status =
                      ticket.status || (ticketIndex % 2 === 0 ? 'Pending' : 'Paid')
                    const price = getPrice(ticket)

                    return (
                      <div key={`${orderGroup.orderId}-${ticketIndex}`}>
                        {/* Desktop row */}
                        <div className="hidden md:grid grid-cols-7 gap-6 lg:gap-16 xl:gap-32 py-3">
                          <div className="text-base lg:text-lg">
                            {ticketIndex === 0 && (
                              <div className="font-medium text-black">
                                {orderGroup.orderId || '00001'}
                              </div>
                            )}
                          </div>
                          <div className="text-base lg:text-lg">
                            {ticketIndex === 0 && (
                              <div className="font-medium text-black">
                                {orderGroup.eventTitle || 'Event'}
                              </div>
                            )}
                          </div>
                          <div className="text-base lg:text-lg font-medium text-black">
                            {ticket.userName || '—'}
                          </div>
                          <div className="text-base lg:text-lg text-black">
                            {ticket.facebookName || '—'}
                          </div>
                          <div className="text-base lg:text-lg text-black">
                            {ticket.memberCode || '—'}
                          </div>
                          <div className="text-base lg:text-lg font-medium text-black">
                            {price}
                          </div>
                          <div className="text-base lg:text-lg">
                            <button
                              type="button"
                              onClick={() => openOrderDetails(orderGroup, ticket)}
                              className={`inline-block px-3 py-1 rounded border text-sm lg:text-lg font-medium cursor-pointer ${getStatusColor(
                                status
                              )} hover:opacity-90 transition`}
                              style={{ background: 'transparent' }}
                            >
                              {status}
                            </button>
                          </div>
                        </div>

                        {/* Mobile card */}
                        <div className="md:hidden text-black mt-3 first:mt-0 rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
                          {ticketIndex === 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">{t('profile.id')}</span>
                              <span className="font-medium text-black">
                                {orderGroup.orderId || '00001'}
                              </span>
                            </div>
                          )}
                          {ticketIndex === 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold">{t('profile.event')}</span>
                              <span className="font-medium text-black max-w-[55%] text-right">
                                {orderGroup.eventTitle || 'Event'}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{t('profile.name')}</span>
                            <span className="font-medium text-black">{ticket.userName || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{t('profile.facebookName')}</span>
                            <span className="text-black max-w-[55%] text-right">
                              {ticket.facebookName || '—'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{t('profile.memberCode')}</span>
                            <span className="text-black">{ticket.memberCode || '—'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold">{t('profile.price')}</span>
                            <span className="font-medium text-black">{price}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-semibold text-sm">Status</span>
                            <button
                              type="button"
                              onClick={() => openOrderDetails(orderGroup, ticket)}
                              className={`px-3 py-1 rounded border text-sm font-medium ${getStatusColor(
                                status
                              )} hover:opacity-90 transition`}
                              style={{ background: 'transparent' }}
                            >
                              {status}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg sm:text-xl font-semibold"></h3>
              <button
                onClick={() => setShowChangePassword(false)}
                className="text-gray-700 hover:text-gray-600 text-2xl font-bold"
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
              >
                ×
              </button>
            </div>
            <div className='text-center mb-6 flex'>
                      <img src={Logo} alt="Logo" className='w-25 h-25 object-contain mb-2' />
                      <h2 className='text-2xl text-gray-800 mt-7 ml-1'>{t('changepw.title')}</h2>
            </div>
            <form
              className="space-y-4 text-black"
              onSubmit={(e) => {
                e.preventDefault()
                setShowChangePassword(false)
              }}
            >
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={t('changepw.oldPassword')}
                />
              </div>
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={t('changepw.newPassword')}
                />
              </div>
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={t('changepw.confirmPassword')}
                />
              </div>
              <div>
                <label className="block text-2xl font-medium text-gray-700 mb-1">
                 Send Verification
                </label>
                <input
                  type="sendVerification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={t('changepw.sendVerification')}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() =>
                    verificationSent ? handleConfirmPassword() : handleSendVerification()
                  }
                  className="flex-1 px-4 py-2 text-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ backgroundColor: '#feb1c3' }}
                >
                  {verificationSent ? t('changepw.confirmPassword') : t('changepw.sendVerification')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <OrderDetails
        isOpen={showOrderDetails}
        onClose={() => setShowOrderDetails(false)}
        order={selectedOrder}
        ticket={selectedTicket}
        meta={selectedOrder?.eventMeta}
      />
    </div>
    </div>
  )
}

export default Profile