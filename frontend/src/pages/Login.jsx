import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, Mail, Lock, Sparkles, UserPlus, ShieldCheck, User } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('user'); // 'user' | 'admin'
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const profile = await login(email, password);

            // Admin mode: only allow admin users
            if (mode === 'admin') {
                if (!profile?.is_admin) {
                    setError('Access denied. This account does not have admin privileges.');
                    setLoading(false);
                    return;
                }
                navigate('/admin');
            } else {
                // User mode: redirect admins to admin dashboard, users to dashboard
                if (profile?.is_admin) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const isAdmin = mode === 'admin';

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg-pattern relative overflow-hidden">
            {/* Background blobs */}
            <div className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-float transition-colors duration-700 ${isAdmin ? 'bg-indigo-600/20' : 'bg-primary-400/20'}`} />
            <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-float transition-colors duration-700 ${isAdmin ? 'bg-purple-600/20' : 'bg-indigo-400/20'}`} style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl animate-pulse-slow" />

            <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">

                {/* Mode Toggle */}
                <div className="flex bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-white/50 gap-1">
                    <button
                        onClick={() => { setMode('user'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${!isAdmin
                            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <User className="h-4 w-4" />
                        Customer Login
                    </button>
                    <button
                        onClick={() => { setMode('admin'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${isAdmin
                            ? 'bg-gradient-to-r from-slate-800 to-indigo-900 text-white shadow-md'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Admin Login
                    </button>
                </div>

                {/* Logo / Header */}
                <div className="text-center animate-bounce-in">
                    <div className={`mx-auto h-20 w-20 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500 shimmer-effect ${isAdmin
                        ? 'bg-gradient-to-br from-slate-700 via-indigo-800 to-purple-900'
                        : 'bg-gradient-to-br from-primary-600 via-primary-500 to-indigo-600'
                        }`}>
                        {isAdmin
                            ? <ShieldCheck className="h-12 w-12 text-white" strokeWidth={2} />
                            : <Shield className="h-12 w-12 text-white" strokeWidth={2.5} />
                        }
                    </div>
                    <div className="mt-6 space-y-2">
                        <h2 className="text-4xl font-bold gradient-text flex items-center justify-center gap-2">
                            {isAdmin ? 'Admin Portal' : 'Welcome Back'}
                            {!isAdmin && <Sparkles className="h-7 w-7 text-yellow-500 animate-pulse" />}
                        </h2>
                        <p className="text-gray-600 text-base">
                            {isAdmin
                                ? 'Sign in with your administrator credentials'
                                : 'Sign in to your insurance account'
                            }
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form
                    className={`mt-8 space-y-6 p-8 rounded-3xl animate-slide-up border transition-all duration-500 ${isAdmin
                        ? 'bg-slate-900/90 backdrop-blur-md border-indigo-800/50 shadow-2xl shadow-indigo-900/30'
                        : 'glass-effect border-white/30'
                        }`}
                    onSubmit={handleSubmit}
                    style={{ animationDelay: '0.2s' }}
                >
                    {/* Admin badge */}
                    {isAdmin && (
                        <div className="flex flex-col gap-2 bg-indigo-900/60 border border-indigo-700/50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                                <p className="text-indigo-300 text-xs font-semibold">
                                    Restricted Access — Admin Credentials
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] text-indigo-400 font-mono mt-1 border-t border-indigo-700/30 pt-2">
                                <div className="flex items-center gap-1">
                                    <span className="opacity-60">EMAIL:</span>
                                    <span className="text-indigo-200">admin@insurance.com</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="opacity-60">PWD:</span>
                                    <span className="text-indigo-200">admin123</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-scale-in">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Email */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="email" className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isAdmin ? 'text-indigo-300' : 'text-gray-700'}`}>
                                <Mail className="h-4 w-4" />
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${isAdmin
                                    ? 'bg-slate-800 border-indigo-700/50 text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500'
                                    : 'input-field'
                                    }`}
                                placeholder={isAdmin ? 'admin@insureai.com' : 'john@example.com'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="password" className={`block text-sm font-semibold mb-2 flex items-center gap-2 ${isAdmin ? 'text-indigo-300' : 'text-gray-700'}`}>
                                <Lock className="h-4 w-4" />
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${isAdmin
                                    ? 'bg-slate-800 border-indigo-700/50 text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500'
                                    : 'input-field'
                                    }`}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${isAdmin
                            ? 'bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 hover:shadow-indigo-500/30 hover:shadow-xl'
                            : 'btn-primary'
                            }`}
                    >
                        {loading ? (
                            <><div className="spinner w-5 h-5 border-2" /> Signing in...</>
                        ) : (
                            <>
                                {isAdmin ? <ShieldCheck className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                {isAdmin ? 'Access Admin Dashboard' : 'Sign In'}
                            </>
                        )}
                    </button>

                    {/* Register link — only for user mode */}
                    {!isAdmin && (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200" />
                                <span className="text-xs text-gray-400 font-medium">OR</span>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>
                            <Link
                                to="/register"
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-primary-500 text-primary-600 font-semibold hover:bg-primary-50 transition-all duration-300 hover:scale-[1.02] transform"
                            >
                                <UserPlus className="h-5 w-5" />
                                Create New Account
                            </Link>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p>🔒 Secured with end-to-end encryption</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
