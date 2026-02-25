import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { policyAPI } from '../api';
import {
    ArrowLeft,
    DollarSign,
    Shield,
    Calendar,
    CheckCircle,
    Building2,
    Info,
    Star,
    Clock,
    FileText,
    TrendingUp
} from 'lucide-react';

const PolicyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [policy, setPolicy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Calculator state
    const [age, setAge] = useState(30);
    const [coverageMultiplier, setCoverageMultiplier] = useState(1.0);
    const [calcData, setCalcData] = useState(null);
    const [calcLoading, setCalcLoading] = useState(false);

    useEffect(() => {
        loadPolicy();
    }, [id]);

    const loadPolicy = async () => {
        try {
            const response = await policyAPI.getById(id);
            setPolicy(response.data);
            // Initialize calculator with base premium
            setCalcData({
                adjusted_premium: response.data.premium,
                total_cost: ((response.data.premium * (response.data.term_months || 12)) / 12).toFixed(2),
                base_premium: response.data.premium
            });
        } catch (error) {
            console.error('Failed to load policy:', error);
            setError('Failed to load policy details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && policy) {
            updateCalculation();
        }
    }, [age, coverageMultiplier]);

    const updateCalculation = async () => {
        setCalcLoading(true);
        try {
            const res = await policyAPI.calculatePremium(id, age, coverageMultiplier);
            setCalcData(res.data);
        } catch (err) {
            console.error('Calculation failed:', err);
        } finally {
            setCalcLoading(false);
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            health: 'from-green-500 to-emerald-500',
            auto: 'from-blue-500 to-cyan-500',
            life: 'from-purple-500 to-pink-500',
            home: 'from-yellow-500 to-orange-500',
            travel: 'from-pink-500 to-rose-500',
        };
        return colors[type] || 'from-gray-500 to-gray-700';
    };

    const getTypeBadgeColor = (type) => {
        const colors = {
            health: 'bg-green-100 text-green-800',
            auto: 'bg-blue-100 text-blue-800',
            life: 'bg-purple-100 text-purple-800',
            home: 'bg-yellow-100 text-yellow-800',
            travel: 'bg-pink-100 text-pink-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !policy) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Not Found</h2>
                    <p className="text-gray-600 mb-8">{error || 'The requested policy could not be found'}</p>
                    <Link to="/recommendations" className="btn-primary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Recommendations
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animated-bg-pattern">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/recommendations" className="inline-flex items-center text-gray-700 hover:text-primary-600 mb-4 font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Recommendations
                    </Link>
                    <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${getTypeColor(policy.policy_type)} text-white font-bold mb-4`}>
                        {policy.policy_type?.toUpperCase()}
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-2">{policy.title}</h1>
                    {policy.provider && (
                        <div className="flex items-center text-gray-600 text-lg">
                            <Building2 className="h-5 w-5 mr-2" />
                            by {policy.provider.name}
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Key Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Pricing Card */}
                        <div className="glass-effect rounded-3xl p-8 animate-scale-in">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <DollarSign className="h-6 w-6 text-green-600" />
                                Premium Calculator
                            </h2>
                            <p className="text-gray-500 text-sm mb-8">Adjust parameters to see your personalized quote</p>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Controls */}
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Your Age</label>
                                            <span className="text-sm font-bold text-indigo-600">{age} years</span>
                                        </div>
                                        <input
                                            type="range" min="18" max="80" value={age}
                                            onChange={(e) => setAge(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>18</span>
                                            <span>80</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-semibold text-gray-700">Coverage Level</label>
                                            <span className="text-sm font-bold text-indigo-600">{coverageMultiplier.toFixed(1)}x</span>
                                        </div>
                                        <input
                                            type="range" min="0.5" max="3.0" step="0.1" value={coverageMultiplier}
                                            onChange={(e) => setCoverageMultiplier(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>Essential (0.5x)</span>
                                            <span>Premium (3.0x)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Results */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden">
                                    {calcLoading && (
                                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                                            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    )}
                                    <p className="text-sm font-semibold text-indigo-600 mb-4 uppercase tracking-wider text-center">Your Estimated Quote</p>
                                    <div className="text-center">
                                        <p className="text-5xl font-black text-indigo-900 mb-1">
                                            ₹{parseFloat(calcData?.adjusted_premium || 0).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-indigo-500 font-medium mb-6">per month</p>

                                        <div className="pt-4 border-t border-indigo-200/50 flex flex-col gap-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Policy Term</span>
                                                <span className="font-bold text-gray-900">{policy.term_months || 12} months</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total Contract Value</span>
                                                <span className="font-bold text-indigo-700">₹{parseFloat(calcData?.total_cost || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 items-start animate-fade-in">
                                <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <strong>Note:</strong> This is an estimate based on your age ({age}) and chosen coverage factor ({coverageMultiplier}x).
                                    {age > 50 ? " Premiums are slightly higher for senior age brackets." : age < 30 ? " You're eligible for a young adult discount." : ""}
                                    The final premium may vary after medical screening or document verification.
                                </p>
                            </div>
                        </div>

                        {/* Coverage Details */}
                        {policy.coverage && Object.keys(policy.coverage).length > 0 && (
                            <div className="glass-effect rounded-3xl p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                    Coverage Details
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.entries(policy.coverage).map(([key, value]) => (
                                        <div key={key} className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">{key}</p>
                                                <p className="text-sm text-gray-600 mt-1">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {policy.description && (
                            <div className="glass-effect rounded-3xl p-8 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-indigo-600" />
                                    Policy Description
                                </h2>
                                <p className="text-gray-700 leading-relaxed">{policy.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Quick Actions & Stats */}
                    <div className="space-y-6">
                        {/* Quick Actions Card */}
                        <div className="glass-effect rounded-3xl p-6 animate-scale-in sticky top-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Take Action</h3>
                            <div className="space-y-3">
                                <button className="btn-primary w-full shimmer-effect">
                                    <Star className="h-4 w-4 mr-2" />
                                    Apply Now
                                </button>
                                <button
                                    onClick={() => navigate(`/policies/compare?ids=${id}`)}
                                    className="w-full px-6 py-3 bg-white hover:bg-gray-50 border-2 border-primary-600 text-primary-600 rounded-xl font-semibold transition-all hover:shadow-lg"
                                >
                                    <TrendingUp className="h-4 w-4 mr-2 inline" />
                                    Compare Policies
                                </button>
                                <Link
                                    to="/preferences"
                                    className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-semibold transition-all flex items-center justify-center"
                                >
                                    <Info className="h-4 w-4 mr-2" />
                                    Update Preferences
                                </Link>
                            </div>
                        </div>

                        {/* Policy Stats */}
                        <div className="glass-effect rounded-3xl p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Policy Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                    <span className="text-sm font-medium text-gray-600">Policy Type</span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTypeBadgeColor(policy.policy_type)}`}>
                                        {policy.policy_type}
                                    </span>
                                </div>
                                {policy.provider && (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                        <span className="text-sm font-medium text-gray-600">Provider</span>
                                        <span className="text-sm font-bold text-gray-900">{policy.provider.name}</span>
                                    </div>
                                )}
                                {policy.term_months && (
                                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                        <span className="text-sm font-medium text-gray-600">Coverage Period</span>
                                        <span className="text-sm font-bold text-gray-900">{policy.term_months} months</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                    <span className="text-sm font-medium text-gray-600">Policy ID</span>
                                    <span className="text-sm font-mono font-bold text-gray-900">#{policy.id}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white animate-scale-in" style={{ animationDelay: '0.2s' }}>
                            <Info className="h-8 w-8 mb-3" />
                            <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                            <p className="text-indigo-100 text-sm mb-4">
                                Have questions about this policy? Our team is here to help you make the right choice.
                            </p>
                            <button className="w-full px-4 py-2 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all">
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetails;
