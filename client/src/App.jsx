import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardLayout from './pages/DashboardLayout'
import Overview from './pages/Overview'
import MenuManagement from './pages/MenuManagement'
import QRCodePage from './pages/QRCodePage'
import CustomerMenu from './pages/CustomerMenu'
import LiveOrders from './pages/LiveOrders'
import Settings from './pages/Settings'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/restaurant/:id/menu" element={<CustomerMenu />} />
      
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="orders" element={<LiveOrders />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="qr" element={<QRCodePage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App