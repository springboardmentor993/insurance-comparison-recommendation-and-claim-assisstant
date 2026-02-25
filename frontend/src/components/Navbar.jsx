import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
    Shield, Bell, LogOut, Menu, X, Sparkles,
    User, ChevronDown, Settings, FileText
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <nav className="glass-effect sticky top-0 z-50 animate-slide-down">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            <Shield className="h-7 w-7 text-white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <span className="text-2xl font-bold gradient-text flex items-center gap-1">
                                InsureVault
                                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                            </span>
                            <span className="text-xs text-gray-500">Your Trusted Insurance Partner</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-6">
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <NavLink to="/policies">Policies</NavLink>
                            <NavLink to="/recommendations">Recommendations</NavLink>
                            <NavLink to="/preferences">Preferences</NavLink>
                            <NavLink to="/claims">Claims</NavLink>
                            {user.is_admin && (
                                <NavLink to="/admin">
                                    <span className="flex items-center gap-1">
                                        Admin
                                        <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs rounded-full font-semibold">Pro</span>
                                    </span>
                                </NavLink>
                            )}

                            {/* Bell */}
                            <button className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-300 transform hover:scale-110">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsProfileOpen(prev => !prev)}
                                    className="flex items-center gap-2 p-1.5 pr-3 hover:bg-primary-50 rounded-xl transition-all duration-300 group border border-transparent hover:border-primary-100"
                                >
                                    <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-all duration-300">
                                        {initials}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                                        <p className="text-xs text-gray-400 leading-tight truncate max-w-[120px]">{user.email}</p>
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-scale-in z-50">
                                        {/* User Info Header */}
                                        <div className="px-4 py-4 bg-gradient-to-br from-primary-50 to-indigo-50 border-b border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold ${user.is_admin
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-primary-100 text-primary-700'
                                                        }`}>
                                                        {user.is_admin ? '⭐ Administrator' : '🛡️ Member'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group"
                                            >
                                                <User className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                                                <span className="font-medium text-sm">View Profile</span>
                                            </Link>
                                            <Link
                                                to="/preferences"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group"
                                            >
                                                <Settings className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                                                <span className="font-medium text-sm">Preferences</span>
                                            </Link>
                                            <Link
                                                to="/claims"
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors group"
                                            >
                                                <FileText className="h-4 w-4 text-gray-400 group-hover:text-primary-600" />
                                                <span className="font-medium text-sm">My Claims</span>
                                            </Link>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100 py-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors group"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span className="font-medium text-sm">Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    {user && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-primary-50 transition-all duration-300"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    )}
                </div>

                {/* Mobile Navigation */}
                {user && isMenuOpen && (
                    <div className="md:hidden pb-4 animate-slide-down">
                        {/* Mobile user info */}
                        <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-primary-50 rounded-xl">
                            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow">
                                {initials}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <MobileNavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</MobileNavLink>
                            <MobileNavLink to="/policies" onClick={() => setIsMenuOpen(false)}>Policies</MobileNavLink>
                            <MobileNavLink to="/recommendations" onClick={() => setIsMenuOpen(false)}>Recommendations</MobileNavLink>
                            <MobileNavLink to="/preferences" onClick={() => setIsMenuOpen(false)}>Preferences</MobileNavLink>
                            <MobileNavLink to="/claims" onClick={() => setIsMenuOpen(false)}>Claims</MobileNavLink>
                            <MobileNavLink to="/profile" onClick={() => setIsMenuOpen(false)}>My Profile</MobileNavLink>
                            {user.is_admin && (
                                <MobileNavLink to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</MobileNavLink>
                            )}
                            <button
                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

const NavLink = ({ to, children }) => (
    <Link
        to={to}
        className="text-gray-700 hover:text-primary-600 font-medium transition-all duration-300 relative group px-3 py-2 rounded-lg hover:bg-primary-50"
    >
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
    </Link>
);

const MobileNavLink = ({ to, children, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className="block px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-all font-medium"
    >
        {children}
    </Link>
);

export default Navbar;
