import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import OrderWorkspace from './pages/OrderWorkspace'
import ProtectedRoute from './components/ui/protected-route'
import './index.css'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: '/dashboard/:orderId',
    element: <ProtectedRoute><OrderWorkspace /></ProtectedRoute>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
