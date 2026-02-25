import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Shield, UserPlus, Mail, Lock, User as UserIcon, Calendar, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                dob: formData.dob || null,
                risk_profile: {}
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg-pattern relative overflow-hidden">
            {/* Floating circles background */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-pulse-slow"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 animate-fade-in">
                {/* Logo/Icon Section */}
                <div className="text-center animate-bounce-in">
                    <div className="mx-auto h-20 w-20 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 shimmer-effect">
                        <UserPlus className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="mt-6 space-y-2">
                        <h2 className="text-5xl font-bold gradient-text flex items-center justify-center gap-2">
                            Join Us Today
                            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
                        </h2>
                        <p className="text-gray-600 text-lg">Create your insurance account</p>
                    </div>
                </div>

                {/* Registration Form */}
                <form
                    className="mt-8 space-y-6 glass-effect p-8 rounded-3xl animate-slide-up"
                    onSubmit={handleSubmit}
                    style={{ animationDelay: '0.2s' }}
                >
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-scale-in">
                            <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Name Field */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-purple-600" />
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="input-field"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email Field */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-purple-600" />
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input-field"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Date of Birth Field */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-purple-600" />
                                Date of Birth
                            </label>
                            <input
                                id="dob"
                                name="dob"
                                type="date"
                                className="input-field"
                                value={formData.dob}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Field */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-purple-600" />
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="transform transition-all duration-300 hover:scale-[1.02]">
                            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-purple-600" />
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="input-field"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <Shield className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                                </>
                            )}
                        </span>
                    </button>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-purple-600 hover:text-purple-800 transition-colors duration-300 hover:underline"
                            >
                                Sign in →
                            </Link>
                        </p>
                    </div>
                </form>

                {/* Footer hint */}
                <div className="text-center text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <p>🔒 Your data is protected with industry-standard encryption</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
