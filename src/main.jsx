import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import OrderWorkspace from './pages/OrderWorkspace'
import Admin from './pages/admin/Admin'
import AdminModelNew from './pages/admin/AdminModelNew'
import AdminModelEdit from './pages/admin/AdminModelEdit'
import ProtectedRoute from './components/ui/protected-route'
import AdminRoute from './components/ui/admin-route'
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
  {
    path: '/admin',
    element: <AdminRoute><Admin /></AdminRoute>,
  },
  {
    path: '/admin/models/new',
    element: <AdminRoute><AdminModelNew /></AdminRoute>,
  },
  {
    path: '/admin/models/:id',
    element: <AdminRoute><AdminModelEdit /></AdminRoute>,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
