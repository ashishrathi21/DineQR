import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import  logo  from "../assets/dashboard_logo.png"
import  small_logo  from "../assets/only_logo.png"
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Clock, Settings, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const { user, isAuthenticated, isCheckingAuth, verifyAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isCheckingAuth, isAuthenticated, navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isCheckingAuth || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  }

  const links = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Live Orders', path: '/dashboard/orders', icon: <Clock size={18} /> },
    { name: 'Menu Management', path: '/dashboard/menu', icon: <UtensilsCrossed size={18} /> },
    { name: 'QR Code', path: '/dashboard/qr', icon: <QrCode size={18} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <img src={logo} alt="logo" width={25} height={25} className='h-8  w-auto' />
          </h1>
          
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700">
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 px-3 space-y-1 py-4">
        {links.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm transition-all ${
                isActive 
                  ? 'text-slate-900 font-medium border-b-2 border-slate-700 ' 
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg bg-white border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-md bg-orange-100 text-orange-600 font-bold text-xs flex items-center justify-center shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50/80 transition-all border border-transparent hover:border-red-100"
        >
          <span>Sign Out</span>
          <LogOut size={16} />
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col md:flex-row font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200/80 flex-col hidden md:flex h-screen sticky top-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200/80 px-5 py-3.5 flex justify-between items-center sticky top-0 z-30 shadow-xs">
        <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
          <img src={small_logo} alt="logo" width={20} height={20} className='h-8 w-auto' />
        </h1>
        <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200/60">
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-white h-full flex flex-col z-10 shadow-xl animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-57px)] md:h-screen md:overflow-hidden">
        <div className="flex-1 md:overflow-y-auto p-5 sm:p-7 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
