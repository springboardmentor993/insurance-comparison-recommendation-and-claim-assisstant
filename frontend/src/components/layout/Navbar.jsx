import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Home, FileText, TrendingUp, FolderOpen, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';

export const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'admin';

    const navLinks = [
        { to: '/', label: 'Home', icon: Home },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin Panel', icon: LayoutDashboard }] : []),
        { to: '/policies', label: 'Policies', icon: FileText },
        { to: '/recommendations', label: 'Recommendations', icon: TrendingUp },
        { to: '/claims', label: 'Claims', icon: FolderOpen },
        { to: '/profile', label: 'Profile', icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    if (!isAuthenticated) return null;

    return (
        <nav className="glass-dark sticky top-0 z-40 border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text hidden sm:block">InsureMe</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive(link.to)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-200">{user?.name || 'User'}</p>
                                <p className="text-xs text-slate-400">{user?.email}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 hover:bg-white/10 rounded-lg"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 animate-slide-in">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(link.to)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
