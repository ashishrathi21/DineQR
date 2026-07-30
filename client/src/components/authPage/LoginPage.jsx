import React, { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      toast.error("Please set VITE_GOOGLE_CLIENT_ID in client/.env");
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
                toast.error("Failed to authenticate with Google.");
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
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h2 className="text-orange-500 font-bold tracking-widest uppercase text-[10px] mb-3">Welcome Back</h2>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Login to DineQR</h1>
          <p className="mt-3 text-slate-600 font-medium text-base">Manage your restaurant dashboard and live orders.</p>
        </div>

        <div className="bg-transparent space-y-6">
          {/* Official Google Auth Button */}
          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider absolute">Or Email Login</span>
          </div>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm font-medium mb-4 text-center">{error}</div>}
          <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address" 
                  autoComplete="off"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <a href="#" className="text-xs font-bold text-orange-500 hover:underline">Forgot?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                <input 
                  required 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  autoComplete="new-password"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm font-medium shadow-sm" 
                />
              </div>
            </div>

            <div className="pt-4">
              <button disabled={isLoading} type="submit" className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isLoading ? 'Signing In...' : (
                  <>Sign In <ArrowRight size={18} /></>
                )}
              </button>
            </div>

            <p className="text-center text-sm text-slate-500 font-medium">
              New to DineQR? 
              <button 
                type="button"
                onClick={() => setIsLogin(false)} 
                className="text-orange-500 font-bold hover:underline ml-1 underline-offset-4 decoration-2"
              >
                Create an account
              </button>
            </p>
          </form>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-400">
           <ShieldCheck size={14} />
           <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted Session</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;