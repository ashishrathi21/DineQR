import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Store, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import DineQR_Logo from '../../assets/DineQR_Logo.png';

const RegisterPage = ({ setIsLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurantName: '',
    location: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');
  
  const { register, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(formData.email)) {
      setValidationError("Only valid @gmail.com email addresses are allowed for registration.");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    const success = await register({
      name: formData.name,
      email: formData.email,
      restaurantName: formData.restaurantName,
      location: formData.location,
      password: formData.password
    });
    
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      setValidationError("Please set VITE_GOOGLE_CLIENT_ID in client/.env");
      return;
    }

    const startOAuthFlow = () => {
      if (window.google?.accounts?.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          callback: async (tokenResponse) => {
            if (tokenResponse.access_token) {
              try {
                const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`);
                const payload = await res.json();

                if (!payload.email || !payload.email.toLowerCase().endsWith("@gmail.com")) {
                  setValidationError("Only valid @gmail.com Google accounts are allowed.");
                  return;
                }

                const success = await googleLogin({
                  name: payload.name,
                  email: payload.email,
                  googleId: payload.sub,
                  avatar: payload.picture
                });

                if (success) {
                  navigate('/dashboard');
                }
              } catch (err) {
                console.error("Failed to fetch Google profile:", err);
                setValidationError("Failed to authenticate with Google.");
              }
            }
          },
        });
        tokenClient.requestAccessToken();
      }
    };

    if (window.google?.accounts?.oauth2) {
      startOAuthFlow();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = startOAuthFlow;
      document.body.appendChild(script);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex items-center justify-center py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-xl w-full">
        
        {/* Brand Header with Official DineQR Logo from assets */}
        <div className="text-center mb-6 space-y-1.5">
          <div className="flex justify-center mb-3">
            <img src={DineQR_Logo} alt="DineQR" className="h-12 sm:h-14 w-auto object-contain" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Register Your Restaurant</h1>
          <p className="text-slate-500 font-normal text-xs">
            Create your account to start managing digital QR table ordering.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-5">
          
          {/* Official Google Auth Button */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-medium rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-100 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-normal text-slate-400 uppercase tracking-wider absolute">Or Enter Details</span>
          </div>

          {error && <div className="bg-red-50 text-red-600 border border-red-100 p-2.5 rounded-lg text-xs font-normal text-center">{error}</div>}
          {validationError && <div className="bg-red-50 text-red-600 border border-red-100 p-2.5 rounded-lg text-xs font-normal text-center">{validationError}</div>}

          <form className="space-y-3.5" onSubmit={handleSubmit} autoComplete="off">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Owner Name *</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" autoComplete="off" className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-xs font-normal text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Email Address *</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@gmail.com" autoComplete="off" className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-xs font-normal text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Restaurant Name *</label>
                <div className="relative group">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                  <input required type="text" name="restaurantName" value={formData.restaurantName} onChange={handleChange} placeholder="The Grand Bistro" autoComplete="off" className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-xs font-normal text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Location *</label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                  <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Mumbai, Maharashtra" autoComplete="off" className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-xs font-normal text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Password *</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                  <input required type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-xs font-normal text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 block">Confirm Password *</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={14} />
                  <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="w-full pl-8 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-xs font-normal text-slate-800 placeholder:text-slate-400" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={isLoading} 
                type="submit" 
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-xs transition-colors shadow-2xs flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : (
                  <>Create Account <ArrowRight size={14} /></>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 font-normal pt-1">
              Already have an account? 
              <button 
                type="button"
                onClick={() => setIsLogin(true)} 
                className="text-orange-600 font-medium hover:underline ml-1"
              >
                Login here
              </button>
            </p>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-400">
           <ShieldCheck size={13} />
           <span className="text-[11px] font-normal">Encrypted & Secure Session</span>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;