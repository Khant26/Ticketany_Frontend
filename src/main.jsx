import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './main.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import router from './routes/index.jsx'
import './i18n'
import { AuthContextProvider } from './contexts/AuthContext.jsx'



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </StrictMode>,
)
