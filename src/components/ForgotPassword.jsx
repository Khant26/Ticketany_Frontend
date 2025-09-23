import React, { useState } from 'react'
import Logo from '../assets/logo.jpg'
import { useTranslation } from 'react-i18next'

function ForgotPassword({ isOpen, onClose, onSwitchToSignIn, onSwitchToSignUp }) {

  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verify, setVerify] = useState('');

  const[sendCode, setSendCode] = useState("Send Code");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password reset email sent to:', email);
    // Add your password reset logic here
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

        <div className='text-center mb-6 flex'>
          <img src={Logo} alt="Logo" className='w-25 h-25 object-contain mb-2' />
          <h2 className='text-2xl text-gray-800 mt-7 ml-1'>Forgot Password?</h2>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200'
              placeholder={t("forgotPassword.emailPlaceholder")}
              required
            />
          </div>

          <div>
            <label htmlFor='email' className='block text-2xl font-medium text-gray-700 mb-1'>
              Enter New Password
            </label>
            <input
              type='newPassword'
              id='newPassword'
              name='newPassword'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200'
              placeholder={t("forgotPassword.newPasswordPlaceholder")}
              required
            />
          </div>

          <div>
            <label htmlFor='email' className='block text-2xl font-medium text-gray-700 mb-1'>
              Confirm Enter New Password
            </label>
            <input
              type='confirmPassword'
              id='confirmPassword'
              name='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200'
              placeholder={t("forgotPassword.confirmPasswordPlaceholder")}
              required
            />
          </div>

          {/* <div className='ml-70'>
            <button
              type='submit'
              className = 'text-blue-600 hover:text-blue-800 text-sm'
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                margin: 0,
              }}
              onClick={() => {
                if (sendCode === "Send Code"){
                  setSendCode("Code Sent");
                }
              }}
            >
              {sendCode}
            </button>
          </div> */}

          {/* <div>
            <label htmlFor='verify' className='block text-2xl font-medium text-gray-700 mb-1'>
              Verify Code
            </label>
            <input
              type='int'
              id='verify'
              name='verify'
              value={verify}
              onChange={(e) => setVerify(e.target.value)}
              className='w-full px-3 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200'
              placeholder='Code'
              required
            />
          </div> */}

          <button
            type='submit'
            className='w-full text-white py-2 px-4 rounded-lg font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 mt-4'
            style={{ backgroundColor: '#feb1c3' }}
          >
           {t('forgotPassword.sendCode')}
          </button>
                  <div>
            <span className="text-black ml-15">{t("signIn.noAccount")}</span>
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
            {t("signIn.signUp")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword