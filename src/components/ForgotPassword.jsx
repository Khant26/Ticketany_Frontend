import React, { useState, useEffect } from 'react'
import Logo from '../assets/logo.jpg'
import { useTranslation } from 'react-i18next'

const ACTIVE_SUBMIT_COLOR = '#e05680';
const INACTIVE_SUBMIT_COLOR = '#f7c7d4';

function ForgotPassword({ isOpen, onClose, onSwitchToSignUp }) {

  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const isOtpValid = otpCode.trim().length === 6;
  const isNewPasswordValid = newPassword.trim().length >= 8;
  const isConfirmPasswordValid = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isSubmitReady = otpSent
    ? isEmailValid && isOtpValid && isNewPasswordValid && isConfirmPasswordValid
    : isEmailValid;

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}auth/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || data?.error || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }

      setSuccess('✅ OTP sent to your email');
      setOtpSent(true);
    } catch {
      setError('Error sending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode.trim()) {
      setError('Please enter OTP code');
      return;
    }

    if (!newPassword.trim()) {
      setError('Please enter new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}auth/reset-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp_code: otpCode,
          new_password: newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message || data?.error || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setSuccess('✅ Password reset successfully! Please login.');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch {
      setError('Error resetting password. Please try again.');
    } finally {
      setIsLoading(false);
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
        className='bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative'
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

        <div className='text-center mb-6 flex flex-col items-center'>
          <img src={Logo} alt="Logo" className='w-24 h-24 object-contain mb-2' />
          <h2 className='text-2xl text-gray-800 mt-4'>{t("signIn.forgotPassword")}</h2>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}

        {success && (
          <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded'>
            {success}
          </div>
        )}

        <form onSubmit={!otpSent ? handleSendOTP : handleResetPassword} className='space-y-4'>
          {!otpSent ? (
            <>
              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                  placeholder={t("forgotPassword.emailPlaceholder")}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type='submit'
                disabled={isLoading || !isSubmitReady}
                className={`w-full text-white py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                  isSubmitReady && !isLoading
                    ? 'hover:opacity-95 transform hover:scale-105'
                    : 'cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isSubmitReady ? ACTIVE_SUBMIT_COLOR : INACTIVE_SUBMIT_COLOR,
                  boxShadow: isSubmitReady ? '0 10px 24px rgba(224, 86, 128, 0.28)' : 'none',
                }}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </>
          ) : (
            <>
              <h3 className='text-lg font-semibold text-gray-800 mb-4'>Enter OTP</h3>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <label className='block text-sm font-medium text-gray-700'>
                    OTP Code
                  </label>
                  <button
                    type='button'
                    onClick={handleSendOTP}
                    disabled={isLoading}
                    className='text-xs text-[#f28fa5] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                    style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                  >
                    Resend OTP
                  </button>
                </div>
                <p className='text-xs text-gray-600 mb-2'>Check your email for the OTP code</p>
                <input
                  type='text'
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                  placeholder='Enter OTP code'
                  maxLength='6'
                  inputMode='numeric'
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  New Password
                </label>
                <input
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                  placeholder='Enter new password (minimum 8 characters)'
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Confirm Password
                </label>
                <input
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500'
                  placeholder='Confirm new password'
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type='submit'
                disabled={isLoading || !isSubmitReady}
                className={`w-full text-white py-2 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 ${
                  isSubmitReady && !isLoading
                    ? 'hover:opacity-95 transform hover:scale-105'
                    : 'cursor-not-allowed'
                }`}
                style={{
                  backgroundColor: isSubmitReady ? ACTIVE_SUBMIT_COLOR : INACTIVE_SUBMIT_COLOR,
                  boxShadow: isSubmitReady ? '0 10px 24px rgba(224, 86, 128, 0.28)' : 'none',
                }}
              >
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </>
          )}

          <div>
            <span className='text-black'>{t("signIn.noAccount")}</span>
            <button 
              type='button'
              onClick={onSwitchToSignUp}
              className='text-blue-600 hover:text-blue-800 ml-2'
              style={{ 
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
               }}
            >
              {t("signIn.signUp")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword