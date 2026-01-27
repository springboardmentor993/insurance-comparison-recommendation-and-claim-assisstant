import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Star, Calculator, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: ShieldCheck },
    { path: '/policies', label: 'Policies', icon: FileText },
    { path: '/recommendations', label: 'Recommendations', icon: Star },
    { path: '/calculator', label: 'Calculator', icon: Calculator },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/home" className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
              <ShieldCheck style={{ width: '28px', height: '28px' }} />
              <span>InsureMe</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    location.pathname === path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut style={{ width: '18px', height: '18px' }} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
