import { Link, useLocation } from 'react-router-dom';
import { Car, Users, ClipboardCheck, LayoutDashboard, UserPlus, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/vehicles', label: 'Vehicles', icon: Car },
    { path: '/visitors', label: 'Visitors', icon: Users },
    { path: '/checkpoint', label: 'Checkpoint', icon: ClipboardCheck },
    { path: '/register-driver', label: 'Add Driver', icon: UserPlus },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-200"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <h1 className="text-lg font-bold text-white">Security Gate</h1>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#163169] border-r transition-transform duration-300 ${
          isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="p-6 mt-16 lg:mt-0">
          <h1 className="text-xl font-bold text-white">Security Gate</h1>
          <p className="text-xs text-gray-500">Checkpoint Management</p>

          {user && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}
        </div>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1f3d7a] text-gray-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-10 left-3 right-3 hidden lg:block">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto mt-16 lg:mt-0">
        <div className="container mx-auto p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
