import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Logo from '../assets/logo.jpg'
import { HiOutlineGlobeAlt } from "react-icons/hi2";
import { HiMiniUser } from "react-icons/hi2";
import { Link } from 'react-router';
import SignUp from './SignUp';
import SignIn from './SignIn';
import ForgotPassword from './ForgotPassword';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState(null); // was hard‑coded 'HybridDev'

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
    setShowForgotPassword(false);
  };

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const closeModals = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowForgotPassword(false);
  };

  // Accept a username from SignIn; no navigation here
  const handleLogin = (name) => {
    if (name) setUserName(name);
    setIsLoggedIn(true);
    closeModals();
  };
  const handleSignout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <div className='fixed top-0 left-4 right-4 flex items-center bg-white rounded-none px-6 py-1 border-b-1 border-gray-500 z-40'>
        <Link to="/">
          <img src={Logo} 
            alt="Logo" 
            className='w-16 h-16 object-contain ml-20'/> 
        </Link>

        <div className='flex items-center flex-1 max-w-6xl mx-8'>
          <div className='relative flex-1'>
            <input
              type="text"
              placeholder={t('nav.search')}
              className='w-full pl-12 pr-6 py-3 bg-gray-200 border-0 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200'
            />
            <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
              <svg className='w-5 h-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
            </div>
          </div>
          <button onClick={() => {}} className='text-white px-6 py-3 rounded ml-1' style={{backgroundColor: '#feb1c3'}}>{t('nav.search')}</button>
        </div>

        <div className='flex items-center ml-0 text-black gap-2'>
          <button
            onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('lng','en'); }}
            className={`
              px-2 py-1 rounded text-sm font-semibold transition-colors
              ${i18n.language === 'en' ? 'text-[#e51f4b]' : 'text-gray-600 hover:text-[#e51f4b]'}
            `}
            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
          >
            {t('nav.language.en')}
          </button>
          <HiOutlineGlobeAlt className='w-5 h-5 mx-1 text-gray-600' />
          <button
            onClick={() => { i18n.changeLanguage('my'); localStorage.setItem('lng','my'); }}
            className={`
              px-2 py-1 rounded text-sm font-semibold transition-colors
              ${i18n.language === 'my' ? 'text-[#e51f4b]' : 'text-gray-600 hover:text-[#e51f4b]'}
            `}
            style={{ backgroundColor: 'transparent', border: 'none', outline: 'none' }}
          >
            {t('nav.language.my')}
          </button>
        </div>

        <div className='relative ml-10'>
          {isLoggedIn ? (
            <div className='flex items-center gap-4'>
              <Link
                to="/profile"
                className='flex items-center text-gray-600 border-none outline-none shadow-none p-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-100'
                style={{ backgroundColor: 'transparent' }}
              >
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-gray-600">
                    {(userName?.charAt(0) || 'U').toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{userName || 'User'}</span>
              </Link>
              <button onClick={handleSignout} className='flex items-center text-gray-600 border-none outline-none shadow-none p-2 cursor-pointer hover:text-blue-600 transition-colors duration-200 rounded-lg hover:bg-gray-100'>
                <HiMiniUser className='w-5 h-5 mr-2' />
                <span>{t('nav.signOut')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignInClick}
              className='flex items-center ml-10 text-gray-600 border-none outline-none shadow-none p-0 cursor-pointer hover:text-blue-600 transition-colors duration-200'
              style={{ backgroundColor: 'transparent' }}
            >
              <HiMiniUser className='w-5 h-5 mr-2' />
              <span>{t('nav.signIn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      <SignUp
        isOpen={showSignUp}
        onClose={closeModals}
        onSwitchToSignIn={handleSignInClick}
      />
      <SignIn
        isOpen={showSignIn}
        onClose={closeModals}
        onSwitchToSignUp={handleSignUpClick}
        onSwitchToForgotPassword={handleForgotPasswordClick}
        onLogin={handleLogin}   // call with username inside SignIn submit
      />
      <ForgotPassword
        isOpen={showForgotPassword}
        onClose={closeModals}
        onSwitchToSignIn={handleSignInClick}
        onSwitchToSignUp={handleSignUpClick}
      />
    </>
  )
}

export default Navbar