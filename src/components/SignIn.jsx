import React, { useState } from 'react'
import Logo from '../assets/logo.jpg'
// Removed unused Link/useParams import to keep component clean
import { useTranslation } from 'react-i18next'


function SignIn({ isOpen, onClose, onSwitchToSignUp, onSwitchToForgotPassword, onLogin }) {

  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store access token for future requests
        const access = data.access_token || data.token || data.access;
        const refresh = data.refresh_token || data.refresh;

        if (access) localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_data', JSON.stringify(data));

        // Derive a display name string for Navbar (avoid passing whole object)
        const extractDisplayName = (payload) => {
          if (!payload) return null;
          const candidates = [
            payload.name,
            payload.username,
            payload.user?.name,
            payload.user?.username,
            payload.user?.email,
            payload.email,
          ];
          const first = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
          if (!first) return null;
          return first.includes('@') ? first.split('@')[0] : first;
        };

        const displayName = extractDisplayName(data) || 'User';

        // Call parent onLogin callback with a string
        if (onLogin) onLogin(displayName);

        // Close modal and clear form
        onClose && onClose();
        setFormData({ email: '', password: '' });
      } else {
        setError(data.error || data.detail || data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <h2 className='text-2xl text-gray-800 mt-7 ml-1'>{t('signIn.title')}</h2>
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

          <div className='flex justify-between items-center text-sm py-1'>
            <button 
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-blue-600 hover:text-blue-800 cursor-pointer font-inherit ml-65"
              style ={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                marginTop: 0,
              }}
            >
              {t('signIn.forgotPassword')}
            </button>
          </div>
          {error && (
            <div className='text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-2'>
              {error}
            </div>
          )}

          <button
            type='submit'
            className='w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200'
            style={{ 
              backgroundColor: '#ee6786ff',              
            }}
            disabled={loading}
          >
            {loading ? t('signIn.signingIn') || 'Signing in...' : t('signIn.signIn')}
          </button>

        <div>
            <span className="text-black ml-15">{t('signIn.noAccount')}</span>
            <button 
              type="button"
              onClick={onSwitchToSignUp}
              className="text-blue-600 hover:text-blue-800"
              style={{ 
                backgroundColor: 'transparent',
                border: 'none',
                padding: 4,
                margin: 0,
               }}
            >
            {t('signIn.signUp')}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default SignIn