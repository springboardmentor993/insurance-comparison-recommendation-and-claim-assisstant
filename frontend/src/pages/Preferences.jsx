import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { authAPI } from '../api';
import {
    Settings,
    Shield,
    DollarSign,
    TrendingUp,
    Save,
    Sparkles,
    Check
} from 'lucide-react';

const Preferences = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [preferences, setPreferences] = useState({
        insurance_type: 'health',
        budget: 'medium',
        priority: 'balanced',
        age: '',
        coverage_amount: ''
    });

    useEffect(() => {
        if (user?.risk_profile) {
            setPreferences({
                insurance_type: user.risk_profile.insurance_type || 'health',
                budget: user.risk_profile.budget || 'medium',
                priority: user.risk_profile.priority || 'balanced',
                age: user.risk_profile.age || '',
                coverage_amount: user.risk_profile.coverage_amount || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);

        try {
            await authAPI.updateProfile({
                risk_profile: preferences
            });

            // Update local user context
            await updateProfile({ risk_profile: preferences });

            setSaved(true);

            // Redirect to recommendations after 1 second
            setTimeout(() => {
                navigate('/recommendations');
            }, 1000);
        } catch (err) {
            console.error('Failed to save preferences:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setPreferences(prev => ({
            ...prev,
            [field]: value
        }));
        setSaved(false);
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animated-bg-pattern">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-10 animate-slide-up">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
                            <Settings className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-white">Preferences</h1>
                            <p className="text-white/70 text-lg">Customize your insurance recommendations</p>
                        </div>
                    </div>
                </div>

                <div className="glass-effect p-8 rounded-3xl animate-scale-in">
                    {saved && (
                        <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-300 p-4 rounded-lg flex items-center gap-2 animate-bounce-in">
                            <Check className="h-5 w-5" />
                            <span>Preferences saved! Redirecting to recommendations...</span>
                        </div>
                    )}

                    <div className="space-y-8">
                        {/* Insurance Type */}
                        <div>
                            <label className="block text-gray-800 font-bold text-lg mb-4">
                                Insurance Type
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['health', 'life', 'vehicle', 'home', 'travel'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleChange('insurance_type', type)}
                                        className={`p-4 rounded-xl font-semibold transition-all duration-300 ${preferences.insurance_type === type
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl scale-105'
                                            : 'bg-white/30 text-gray-700 hover:bg-white/40'
                                            }`}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="block text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-gray-700" />
                                Budget
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['low', 'medium', 'high'].map((budget) => (
                                    <button
                                        key={budget}
                                        onClick={() => handleChange('budget', budget)}
                                        className={`p-4 rounded-xl font-semibold transition-all duration-300 ${preferences.budget === budget
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl scale-105'
                                            : 'bg-white/30 text-gray-700 hover:bg-white/40'
                                            }`}
                                    >
                                        {budget.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ranking Priority */}
                        <div>
                            <label className="block text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-gray-700" />
                                Ranking Priority
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'cheap', label: 'Cheap Premium' },
                                    { value: 'balanced', label: 'Balanced' },
                                    { value: 'coverage', label: 'Strong Coverage' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleChange('priority', option.value)}
                                        className={`p-4 rounded-xl font-semibold transition-all duration-300 ${preferences.priority === option.value
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-xl scale-105'
                                            : 'bg-white/30 text-gray-700 hover:bg-white/40'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-gray-800 font-bold text-lg mb-4">
                                Age
                            </label>
                            <input
                                type="number"
                                min="18"
                                max="100"
                                className="input-field text-lg"
                                placeholder="Enter your age"
                                value={preferences.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                            />
                        </div>

                        {/* Desired Coverage Amount */}
                        <div>
                            <label className="block text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-gray-700" />
                                Desired Coverage Amount (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="10000"
                                className="input-field text-lg"
                                placeholder="Enter desired coverage amount"
                                value={preferences.coverage_amount}
                                onChange={(e) => handleChange('coverage_amount', e.target.value)}
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg shimmer-effect"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="spinner w-5 h-5 border-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Preferences
                                        <Sparkles className="h-5 w-5 animate-pulse" />
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-200">
                            <p className="font-semibold mb-2">💡 How it works:</p>
                            <p>Your preferences will be used to generate personalized policy recommendations. We'll match you with policies that fit your budget, coverage needs, and priorities!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
