import React from 'react'
import Logo  from '../assets/logo.jpg'
import { Link } from 'react-router'
import { SocialIcon } from 'react-social-icons'

function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 flex items-center bg-white shadow-lg rounded-none px-6 py-2 border-t border-gray-300 ">
        <span className='text-black ml-30'>Made By HybridDev. @ 2025</span>
        <Link to="/">
            <img src={Logo} 
            alt="Logo" 
            className='w-16 h-16 object-contain ml-90'/> 
      </Link>
      <span className='text-black ml-5 text-2xl'>Tickets Anywhere</span>
      <SocialIcon url="www.facebook.com" className='ml-5'/>
      <SocialIcon url="www.instagram.com" className='ml-120'/>
      <SocialIcon url="www.telegram.com" className='ml-5'/>
    </footer>
  )
}

export default Footer