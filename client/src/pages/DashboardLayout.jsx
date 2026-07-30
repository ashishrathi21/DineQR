import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Clock, Settings, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const { user, isAuthenticated, isLoading, verifyAuth, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (isLoading || !user) {
    return <div className="h-screen w-full flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  }

  const links = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Live Orders', path: '/dashboard/orders', icon: <Clock size={20} /> },
    { name: 'Menu Management', path: '/dashboard/menu', icon: <UtensilsCrossed size={20} /> },
    { name: 'QR Code', path: '/dashboard/qr', icon: <QrCode size={20} /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dine<span className="text-orange-500">QR</span></h1>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Dashboard</p>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/dashboard' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}`}
            >
              {link.icon}
              <span className="font-bold">{link.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl bg-slate-50">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 font-bold transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Dine<span className="text-orange-500">QR</span></h1>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-slate-700 hover:bg-slate-100">
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[calc(100vh-65px)] md:h-screen md:overflow-hidden">
        <div className="flex-1 md:overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
