import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  HeartHandshake, 
  FileText, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link 
    to={to} 
    className={`group flex items-center justify-between px-4 py-3.5 mx-3 rounded-xl transition-all duration-200 ease-in-out ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
        : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    <div className="flex items-center space-x-3">
      <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'} />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </div>
    {active && <ChevronRight size={16} className="text-indigo-200" />}
  </Link>
);

export const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { logout, user, userName } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/cultos', icon: Users, label: 'Cultos & Jornadas' },
    { to: '/atendimentos', icon: HeartHandshake, label: 'Atendimentos' },
    { to: '/atividades', icon: Calendar, label: 'Atividades Extras' },
    { to: '/relatorios', icon: FileText, label: 'Relatórios' },
  ];

  const getPageTitle = () => {
    const item = navItems.find(i => i.to === location.pathname);
    return item ? item.label : 'CADFC Gestão';
  };

  // Safe display name logic
  const displayName = userName || user?.email || 'Usuário';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo Area */}
          <div className="px-8 py-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">CADFC</h1>
                <p className="text-xs text-slate-400 font-medium">Gestão Eclesiástica</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 py-4 overflow-y-auto">
            <div className="px-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu Principal</div>
            {navItems.map((item) => (
              <SidebarItem 
                key={item.to} 
                {...item} 
                active={location.pathname === item.to} 
              />
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 truncate" title={displayName}>{displayName}</p>
                <p className="text-xs text-slate-400">Administrador</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={14} />
              <span>Encerrar Sessão</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Mobile/Desktop */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-6 py-4 flex justify-between items-center lg:hidden">
            <div className="flex items-center space-x-3">
               <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
               </div>
               <span className="font-bold text-slate-800">{getPageTitle()}</span>
            </div>
            <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </header>
        
        {/* Desktop Header Title (Optional, visually nice) */}
        <header className="hidden lg:flex px-8 py-6 items-center justify-between bg-transparent">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">{getPageTitle()}</h2>
                <p className="text-slate-500 text-sm mt-1">Bem-vindo de volta ao painel de controle.</p>
             </div>
             <div className="text-sm text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
             </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 pt-0">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};