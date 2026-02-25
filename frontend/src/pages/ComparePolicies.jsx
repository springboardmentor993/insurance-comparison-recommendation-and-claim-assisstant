import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { policyAPI } from '../api';
import {
    ArrowLeft,
    DollarSign,
    Shield,
    Calendar,
    CheckCircle,
    Calculator,
    TrendingUp,
    X
} from 'lucide-react';

const ComparePolicies = () => {
    const [searchParams] = useSearchParams();
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showCalculator, setShowCalculator] = useState(false);
    const [quoteInputs, setQuoteInputs] = useState({
        age: 30,
        coverage_multiplier: 1.0
    });
    const [quoteResult, setQuoteResult] = useState(null);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        loadPolicies();
    }, [searchParams]);

    const loadPolicies = async () => {
        try {
            const ids = searchParams.get('ids');
            if (!ids) {
                setLoading(false);
                return;
            }

            const response = await policyAPI.compare(ids);
            setPolicies(response.data);
        } catch (error) {
            console.error('Failed to load policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateQuote = async (policyId) => {
        setCalculating(true);
        try {
            const response = await policyAPI.calculatePremium(policyId, quoteInputs);
            setQuoteResult(response.data);
        } catch (error) {
            console.error('Failed to calculate quote:', error);
        } finally {
            setCalculating(false);
        }
    };

    const openCalculator = (policy) => {
        setSelectedPolicy(policy);
        setShowCalculator(true);
        setQuoteResult(null);
        calculateQuote(policy.id);
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

    if (policies.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Policies Selected</h2>
                    <p className="text-gray-600 mb-8">Please select at least 2 policies to compare</p>
                    <Link to="/policies" className="btn-primary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Policies
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animated-bg-pattern">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <Link to="/policies" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Policies
                    </Link>
                    <h1 className="text-4xl font-bold gradient-text mb-2">Policy Comparison</h1>
                    <p className="text-gray-600 text-lg">Compare {policies.length} policies side-by-side</p>
                </div>

                {/* Desktop Comparison Table */}
                <div className="hidden lg:block">
                    <div className="glass-effect rounded-3xl overflow-hidden animate-scale-in">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="p-6 text-left text-sm font-semibold text-gray-700 w-48">Feature</th>
                                    {policies.map((policy) => (
                                        <th key={policy.id} className="p-6 text-center">
                                            <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${getTypeColor(policy.policy_type)} text-white font-bold mb-2`}>
                                                {policy.policy_type?.toUpperCase()}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mt-2">{policy.title}</h3>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Premium */}
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                            Monthly Premium
                                        </div>
                                    </td>
                                    {policies.map((policy) => (
                                        <td key={policy.id} className="p-6 text-center">
                                            <span className="text-2xl font-bold text-gray-900">₹{policy.premium}</span>
                                            <span className="text-gray-600 text-sm ml-1">/mo</span>
                                        </td>
                                    ))}
                                </tr>

                                {/* Deductible */}
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                            Deductible
                                        </div>
                                    </td>
                                    {policies.map((policy) => (
                                        <td key={policy.id} className="p-6 text-center text-gray-900">
                                            {policy.deductible ? `₹${policy.deductible}` : 'N/A'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Term */}
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-purple-600" />
                                            Policy Term
                                        </div>
                                    </td>
                                    {policies.map((policy) => (
                                        <td key={policy.id} className="p-6 text-center text-gray-900">
                                            {policy.term_months ? `${policy.term_months} months` : 'N/A'}
                                        </td>
                                    ))}
                                </tr>

                                {/* Coverage */}
                                <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-6 font-medium text-gray-800">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            Coverage Details
                                        </div>
                                    </td>
                                    {policies.map((policy) => (
                                        <td key={policy.id} className="p-6">
                                            {policy.coverage ? (
                                                <div className="space-y-1 text-sm text-gray-700">
                                                    {Object.entries(policy.coverage).slice(0, 4).map(([key, value]) => (
                                                        <div key={key} className="flex items-start gap-2">
                                                            <CheckCircle className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                                                            <span>{key}: {value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">No details</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>

                                {/* Calculate Quote Button */}
                                <tr>
                                    <td className="p-6"></td>
                                    {policies.map((policy) => (
                                        <td key={policy.id} className="p-6 text-center">
                                            <button
                                                onClick={() => openCalculator(policy)}
                                                className="btn-primary w-full shimmer-effect"
                                            >
                                                <Calculator className="h-4 w-4 mr-2" />
                                                Calculate Quote
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile/Tablet Comparison Cards */}
                <div className="lg:hidden space-y-6">
                    {policies.map((policy, index) => (
                        <div
                            key={policy.id}
                            className="glass-effect rounded-3xl p-6 animate-scale-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className={`inline-block px-4 py-2 rounded-xl bg-gradient-to-r ${getTypeColor(policy.policy_type)} text-white font-bold mb-4`}>
                                {policy.policy_type?.toUpperCase()}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">{policy.title}</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-700 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-green-400" />
                                        Monthly Premium
                                    </span>
                                    <span className="text-xl font-bold text-gray-900">₹{policy.premium}/mo</span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-700 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-blue-400" />
                                        Deductible
                                    </span>
                                    <span className="text-gray-900">{policy.deductible ? `₹${policy.deductible}` : 'N/A'}</span>
                                </div>

                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-gray-700 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-purple-400" />
                                        Policy Term
                                    </span>
                                    <span className="text-gray-900">{policy.term_months ? `${policy.term_months} months` : 'N/A'}</span>
                                </div>

                                {policy.coverage && (
                                    <div className="pb-4 border-b border-gray-200">
                                        <span className="text-gray-700 flex items-center gap-2 mb-3">
                                            <CheckCircle className="h-5 w-5 text-emerald-400" />
                                            Coverage Details
                                        </span>
                                        <div className="space-y-2 text-sm text-gray-700 ml-7">
                                            {Object.entries(policy.coverage).slice(0, 4).map(([key, value]) => (
                                                <div key={key} className="flex items-start gap-2">
                                                    <CheckCircle className="h-3 w-3 text-green-400 mt-1 flex-shrink-0" />
                                                    <span>{key}: {value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => openCalculator(policy)}
                                    className="btn-primary w-full shimmer-effect mt-4"
                                >
                                    <Calculator className="h-4 w-4 mr-2" />
                                    Calculate Quote
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quote Calculator Modal */}
            {showCalculator && selectedPolicy && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="glass-effect rounded-3xl max-w-2xl w-full p-8 animate-bounce-in">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold gradient-text mb-2">Quote Calculator</h2>
                                <p className="text-white/80 text-lg">{selectedPolicy.title}</p>
                                <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium mt-2 ${getTypeBadgeColor(selectedPolicy.policy_type)}`}>
                                    {selectedPolicy.policy_type}
                                </span>
                            </div>
                            <button
                                onClick={() => setShowCalculator(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-6 mb-8">
                            {/* Age Input */}
                            <div>
                                <label className="block text-white font-semibold mb-3">
                                    Your Age: <span className="text-cyan-400">{quoteInputs.age}</span>
                                </label>
                                <input
                                    type="range"
                                    min="18"
                                    max="100"
                                    value={quoteInputs.age}
                                    onChange={(e) => {
                                        const newAge = parseInt(e.target.value);
                                        setQuoteInputs({ ...quoteInputs, age: newAge });
                                        calculateQuote(selectedPolicy.id);
                                    }}
                                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                                />
                                <div className="flex justify-between text-white/60 text-sm mt-2">
                                    <span>18</span>
                                    <span>100</span>
                                </div>
                            </div>

                            {/* Coverage Multiplier */}
                            <div>
                                <label className="block text-white font-semibold mb-3">
                                    Coverage Level: <span className="text-cyan-400">{quoteInputs.coverage_multiplier}x</span>
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="3.0"
                                    step="0.1"
                                    value={quoteInputs.coverage_multiplier}
                                    onChange={(e) => {
                                        const newMultiplier = parseFloat(e.target.value);
                                        setQuoteInputs({ ...quoteInputs, coverage_multiplier: newMultiplier });
                                        calculateQuote(selectedPolicy.id);
                                    }}
                                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider-thumb"
                                />
                                <div className="flex justify-between text-white/60 text-sm mt-2">
                                    <span>0.5x (Basic)</span>
                                    <span>3.0x (Premium)</span>
                                </div>
                            </div>
                        </div>

                        {/* Quote Results */}
                        {calculating ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                                <p className="text-white/60 mt-4">Calculating your personalized quote...</p>
                            </div>
                        ) : quoteResult ? (
                            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6 border border-cyan-400/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="h-6 w-6 text-cyan-400" />
                                    <h3 className="text-xl font-bold text-white">Your Personalized Quote</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <p className="text-white/70 text-sm mb-1">Base Premium</p>
                                        <p className="text-2xl font-bold text-white">₹{quoteResult.base_premium}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <p className="text-white/70 text-sm mb-1">Age Factor</p>
                                        <p className="text-2xl font-bold text-cyan-400">{quoteResult.age_factor}x</p>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-center">
                                    <p className="text-cyan-100 text-sm mb-2">Adjusted Monthly Premium</p>
                                    <p className="text-5xl font-bold text-white mb-4">₹{quoteResult.adjusted_premium}</p>
                                    <div className="h-px bg-white/30 my-4"></div>
                                    <p className="text-cyan-100 text-sm mb-1">Total Cost ({quoteResult.term_months || 12} months)</p>
                                    <p className="text-3xl font-bold text-white">₹{quoteResult.total_cost}</p>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button className="btn-primary flex-1">
                                        Apply Now
                                    </button>
                                    <button
                                        onClick={() => setShowCalculator(false)}
                                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparePolicies;
