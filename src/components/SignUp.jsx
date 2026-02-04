import React, { useState } from 'react'
import Logo from '../assets/logo.jpg'
import { useTranslation } from 'react-i18next'

function SignUp({ isOpen, onClose, onSwitchToSignIn }) {

  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otpCode, setOtpCode] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    const nameFromEmail = formData.email.split('@')[0];
    if (!nameFromEmail.trim()) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';
      
      const payload = {
        email: formData.email.trim(),
        name: nameFromEmail,
        password: formData.password
      };

      console.log('[handleRegister] Payload:', payload);
      console.log('[handleRegister] API URL:', `${API_BASE_URL}auth/register/`);
      
      const registerRes = await fetch(`${API_BASE_URL}auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[handleRegister] Response status:', registerRes.status);
      const data = await registerRes.json().catch(() => ({}));
      console.log('[handleRegister] Response data:', data);

      if (!registerRes.ok) {
        let errorMessage = 'Registration failed. Please try again.';
        
        // Handle various error formats
        if (data?.message) errorMessage = data.message;
        else if (data?.error) errorMessage = data.error;
        else if (data?.detail) errorMessage = data.detail;
        else if (data?.email && Array.isArray(data.email)) errorMessage = data.email[0];
        else if (data?.password && Array.isArray(data.password)) errorMessage = data.password[0];
        else if (data?.non_field_errors && Array.isArray(data.non_field_errors)) errorMessage = data.non_field_errors[0];
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setSuccess('✅ Registration successful! Check your email for OTP code.');
      setShowOtpVerification(true);
      setLoading(false);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error during registration. Please check your internet connection.');
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (otpCode.length !== 6) {
      setError('OTP code must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';
      
      const payload = {
        email: formData.email.trim(),
        otp_code: otpCode.trim()
      };

      console.log('[handleVerifyEmail] Payload:', payload);
      console.log('[handleVerifyEmail] API URL:', `${API_BASE_URL}auth/verify-email/`);
      
      const verifyRes = await fetch(`${API_BASE_URL}auth/verify-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[handleVerifyEmail] Response status:', verifyRes.status);
      const data = await verifyRes.json().catch(() => ({}));
      console.log('[handleVerifyEmail] Response data:', data);

      if (!verifyRes.ok) {
        let errorMessage = 'OTP verification failed. Please try again.';
        
        // Handle various error formats
        if (data?.message) errorMessage = data.message;
        else if (data?.error) errorMessage = data.error;
        else if (data?.detail) errorMessage = data.detail;
        else if (data?.otp_code && Array.isArray(data.otp_code)) errorMessage = data.otp_code[0];
        else if (data?.email && Array.isArray(data.email)) errorMessage = data.email[0];
        else if (data?.non_field_errors && Array.isArray(data.non_field_errors)) errorMessage = data.non_field_errors[0];
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      setSuccess('✅ Email verified successfully! You can now sign in.');
      setTimeout(() => {
        onSwitchToSignIn();
        setFormData({ email: '', password: '' });
        setOtpCode('');
        setShowOtpVerification(false);
      }, 2000);
      setLoading(false);
    } catch (err) {
      console.error('Verification error:', err);
      setError('Error during verification. Please check your internet connection.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (showOtpVerification) {
      handleVerifyEmail(e);
    } else {
      handleRegister(e);
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
          <h2 className='text-2xl text-gray-800 mt-7 ml-1'>{t('signUp.title')}</h2>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {error && (
            <div className='p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
              {error}
            </div>
          )}

          {success && (
            <div className='p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
              {success}
            </div>
          )}

          {!showOtpVerification && (
            <>
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
                  minLength='8'
                  required
                />
                <p className='text-xs text-gray-600 mt-1'>Minimum 8 characters</p>
              </div>
            </>
          )}

          {showOtpVerification && (
            <div>
              <label htmlFor='otpCode' className='block text-2xl font-medium text-gray-700 mb-1'>
                OTP Code
              </label>
              <p className='text-sm text-gray-600 mb-2'>
                Check your email ({formData.email}) for the 6-digit OTP code
              </p>
              <input
                type='text'
                id='otpCode'
                value={otpCode}
                onChange={(e) => {
                  // Only allow digits and limit to 6
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(value);
                }}
                className='w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-mono'
                placeholder='000000'
                maxLength='6'
                inputMode='numeric'
                required
              />
              <p className='text-xs text-gray-600 mt-1'>Enter the 6-digit code from your email</p>
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed'
            style={{ backgroundColor: '#ee6786ff' }}
          >
            {loading ? (showOtpVerification ? 'Verifying...' : 'Registering...') : (showOtpVerification ? 'Verify Email' : t('signUp.signUp'))}
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