import React, { useState } from 'react'
import RegisterPage from '../components/authPage/RegisterPage'
import LoginPage from '../components/authPage/LoginPage'

const AuthPage = () => {
  // State to toggle between Login and Register
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white transition-all duration-500">
        {isLogin ? (
          <LoginPage setIsLogin={setIsLogin} />
        ) : (
          <RegisterPage setIsLogin={setIsLogin} />
        )}
    </div>
  )
}

export default AuthPage