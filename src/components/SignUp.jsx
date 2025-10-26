import React, { useState } from 'react'
import Logo from '../assets/logo.jpg'
import { useTranslation } from 'react-i18next'

function SignUp({ isOpen, onClose, onSwitchToSignIn }) {

  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log('Form submitted:', formData);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className='fixed inset-0 flex items-center justify-center px-4'
      style={{ 
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      onClick={handleBackdropClick}
    >
      <div 
        className='bg-white rounded-lg shadow-2xl p-8 w-full max-w-md relative'
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className='absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold'
          style={{ 
            backgroundColor: 'transparent',
            border: 'none'
           }}
        >
          ×
        </button>

        <div className='text-center mb-6 flex'>
          <img src={Logo} alt="Logo" className='w-25 h-25 object-contain mb-2' />
          <h2 className='text-2xl text-gray-800 mt-7 ml-1'>{t('signUp.title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-2xl font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              className='w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200'
              placeholder={t('signIn.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-2xl font-medium text-gray-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleChange}
              className='w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200'
              placeholder={t('signIn.passwordPlaceholder')}
              required
            />
          </div>



          <button
            type='submit'
            className='w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 mt-4'
            style={{ backgroundColor: '#ee6786ff' }}
          >
            {t('signUp.signUp')}
          </button>
          <div>
             <span className="text-black ml-15">{t('signUp.Already')}</span>
            <button 
              type="button"
              onClick={onSwitchToSignIn}
              className="text-blue-600 hover:text-blue-800"
              style={{ 
                backgroundColor: 'transparent',
                border: 'none',
                padding: 4,
                margin: 0,
               }}
            >
              {t('signIn.signIn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp