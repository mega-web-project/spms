import { Link, useLocation } from 'react-router-dom';
import { Car, Users, ClipboardCheck, LayoutDashboard, UserPlus, Menu, X, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';


function getRandomColor() {
  const colors = [
    "f87171", // red-400
    "facc15", // yellow-400
    "4ade80", // green-400
    "60a5fa", // blue-400
    "a78bfa", // violet-400
    "f472b6", // pink-400
    "34d399", // emerald-400
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
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
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/vehicles", label: "Vehicles", icon: Car },
    { path: "/visitors", label: "Visitors", icon: Users },
    { path: "/checkpoint", label: "Checkpoint", icon: ClipboardCheck },
    { path: "/register-driver", label: "Add Driver", icon: UserPlus },
    { path: "/manage-users", label: "Manage Users", icon: UserCog, role: "admin" },
  ];



  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1f3d7a] border-b z-40 flex items-center justify-between px-4 text-white">
        {/* Left section: menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md hover:bg-blue-900/40 transition"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
          <h1 className="text-lg font-semibold">Security Gate</h1>
        </div>

        {/* Right section: profile image + logout */}
        <div className="flex items-center gap-3">
          {/* Profile image */}
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.full_name}`}

            alt="Profile"
            className="h-9 w-9 rounded-full border-2 border-white object-cover"
          />

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-blue-900/40 transition"
            title="Logout"
          >
            <LogOut className="h-5 w-5 text-white" />
          </button>
        </div>
      </header>


      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#163169] border-r transition-transform duration-300 ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'
          }`}
      >
        <div className="p-6 mt-16 lg:mt-0">
          <h1 className="text-xl font-bold text-white">Security Gate</h1>
          <p className="text-xs text-gray-500">Checkpoint Management</p>
        </div>

        <nav className="px-3 space-y-1">
          {navItems
            .filter((item) => user?.role === "admin" || item.label !== "Manage Users") // ✅ Hide 'Manage Users' if not admin
            .map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-white text-sm font-medium transition-colors ${isActive ? 'bg-[#1f3d7a] text-gray-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-600'}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
        </nav>


        <div className="absolute bottom-16 left-3 right-3 hidden lg:block">
          <div className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-100">
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.full_name || "Admin"
                  )}&background=${getRandomColor()}&color=fff`
                }
                alt={user?.full_name || "Admin"}
                className="h-8 w-8 rounded-full border border-gray-300 object-cover transition-transform hover:scale-105"
              />
              <span className="text-gray-700 font-medium truncate max-w-[120px] capitalize">
                {user?.full_name || "Admin"}
              </span>
            </div>


            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
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
