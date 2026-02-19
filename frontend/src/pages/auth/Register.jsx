import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Calendar, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        dob: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const getPasswordStrength = () => {
        const { password } = formData;
        if (!password) return { strength: 0, label: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

        return { strength, label: labels[strength - 1] || '', color: colors[strength - 1] || '' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                dob: formData.dob || null,
            });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = getPasswordStrength();

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Card className="w-full max-w-md text-center" glass>
                    <div className="inline-flex p- bg-green-500/20 rounded-full mb-4">
                        <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
                    <p className="text-slate-400 mb-4">Redirecting to login...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <Card className="w-full max-w-md relative z-10 animate-scale-up" glass>
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                        <Shield className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
                    <p className="text-slate-400">Join us to get started</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        icon={User}
                        required
                    />

                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon={Mail}
                        required
                    />

                    <Input
                        label="Date of Birth (Optional)"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        icon={Calendar}
                    />

                    <div className="relative">
                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            icon={Lock}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-300"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>

                        {/* Password strength indicator */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded-full ${i < passwordStrength.strength ? passwordStrength.color : 'bg-slate-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400">{passwordStrength.label}</p>
                            </div>
                        )}
                    </div>

                    <Input
                        label="Confirm Password"
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={Lock}
                        required
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full mt-6"
                        loading={loading}
                    >
                        Create Account
                    </Button>
                </form>

                <p className="mt-6 text-center text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign in
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default Register;
