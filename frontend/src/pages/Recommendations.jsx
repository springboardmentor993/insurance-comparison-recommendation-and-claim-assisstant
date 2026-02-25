import React, { useState, useEffect } from 'react';
import { recommendationAPI } from '../api';
import {
    Award,
    RefreshCw,
    TrendingUp,
    DollarSign,
    ArrowRight,
    Shield,
    Calendar,
    CheckCircle,
    Star,
    Sparkles,
    ThumbsUp,
    Target,
    Clock,
    Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            const response = await recommendationAPI.get();
            setRecommendations(response.data);
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        setLoading(true);
        try {
            const response = await recommendationAPI.regenerate();
            setRecommendations(response.data);
        } catch (error) {
            console.error('Failed to regenerate:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-blue-500 to-cyan-600';
        if (score >= 40) return 'from-yellow-500 to-orange-600';
        return 'from-gray-500 to-gray-600';
    };

    const getScoreBadge = (score) => {
        if (score >= 80) return { text: 'Excellent Match', color: 'bg-green-100 text-green-800' };
        if (score >= 60) return { text: 'Good Match', color: 'bg-blue-100 text-blue-800' };
        if (score >= 40) return { text: 'Fair Match', color: 'bg-yellow-100 text-yellow-800' };
        return { text: 'Low Match', color: 'bg-gray-100 text-gray-800' };
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

    return (
        <div className="min-h-screen animated-bg-pattern">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Section */}
                <div className="mb-10 animate-slide-up">
                    <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="h-8 w-8 text-yellow-500" />
                        <h1 className="text-5xl font-bold gradient-text">Your Personalized Recommendations</h1>
                    </div>
                    <p className="text-gray-700 text-lg max-w-3xl mb-6">
                        We've analyzed your preferences and found the perfect insurance policies tailored just for you.
                        Each recommendation is ranked by compatibility to help you make the best decision.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={handleRegenerate} className="btn-primary flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            <span>Refresh Recommendations</span>
                        </button>
                        <Link to="/preferences" className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Update Preferences
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-lg">Finding the best policies for you...</p>
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="glass-effect rounded-3xl p-16 text-center animate-scale-in">
                        <Award className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">No Recommendations Yet</h3>
                        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                            Set your preferences to receive personalized insurance policy recommendations
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/preferences" className="btn-primary">
                                <Target className="h-4 w-4 mr-2" />
                                Set Your Preferences
                            </Link>
                            <button onClick={handleRegenerate} className="btn-secondary">
                                Generate Recommendations
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Stats Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="glass-effect rounded-2xl p-5 animate-scale-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                                        <Award className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Matches</p>
                                        <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-effect rounded-2xl p-5 animate-scale-in" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                                        <Star className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Best Match</p>
                                        <p className="text-2xl font-bold text-green-600">{Math.round(Math.max(...recommendations.map(r => r.score)))}%</p>
                                    </div>
                                </div>
                            </div>
                            <div className="glass-effect rounded-2xl p-5 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Avg. Match</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {Math.round(recommendations.reduce((sum, r) => sum + r.score, 0) / recommendations.length)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recommendations List - Grouped by Type */}
                        {['health', 'life', 'auto', 'home', 'travel'].map((type) => {
                            const typeRecs = recommendations.filter(r => r.policy?.policy_type === type);
                            if (typeRecs.length === 0) return null;

                            const sectionTitle = {
                                health: 'Health Insurance',
                                life: 'Life Insurance',
                                auto: 'Vehicle Insurance',
                                home: 'Home Insurance',
                                travel: 'Travel Insurance'
                            }[type];

                            return (
                                <div key={type} className="mb-16">
                                    <div className={`flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-r ${getTypeColor(type)} bg-opacity-10`}>
                                        <div className="p-2 bg-white rounded-full shadow-sm">
                                            <Shield className={`h-6 w-6 text-${getTypeColor(type).split('-')[1]}-600`} />
                                        </div>
                                        <h2 className="text-3xl font-bold text-white drop-shadow-md">
                                            Top {sectionTitle} Picks
                                        </h2>
                                    </div>

                                    <div className="space-y-8">
                                        {typeRecs.map((rec, index) => {
                                            const scoreBadge = getScoreBadge(rec.score);
                                            return (
                                                <div
                                                    key={rec.id}
                                                    className="glass-effect rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 animate-scale-in border-2 border-transparent hover:border-blue-300"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    {/* Header with Match Score */}
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                                                        <div className="flex-1">
                                                            <div className="flex items-start gap-4 mb-4">
                                                                {/* Match Score Circle */}
                                                                <div className={`relative flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br ${getScoreGradient(rec.score)} p-1 shadow-lg`}>
                                                                    <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center">
                                                                        <span className={`text-3xl font-bold bg-gradient-to-br ${getScoreGradient(rec.score)} bg-clip-text text-transparent`}>
                                                                            {Math.round(rec.score)}%
                                                                        </span>
                                                                        <span className="text-xs text-gray-600 font-medium">Match</span>
                                                                    </div>
                                                                </div>

                                                                {/* Policy Title & Type */}
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${scoreBadge.color}`}>
                                                                            {scoreBadge.text}
                                                                        </span>
                                                                        {index === 0 && (
                                                                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-yellow-100 text-yellow-800 flex items-center gap-1">
                                                                                <Star className="h-3 w-3" />
                                                                                Top Pick
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                                                        {rec.policy?.title}
                                                                    </h3>
                                                                    <div className={`inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r ${getTypeColor(rec.policy?.policy_type)} text-white font-bold text-sm`}>
                                                                        <Shield className="h-4 w-4 mr-2" />
                                                                        {rec.policy?.policy_type?.toUpperCase()} INSURANCE
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Why Recommended */}
                                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-5 rounded-xl mb-6">
                                                                <div className="flex items-start gap-3">
                                                                    <ThumbsUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="font-bold text-gray-900 mb-1">Why this is perfect for you:</p>
                                                                        <p className="text-gray-700 leading-relaxed">{rec.reason}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Key Features Grid */}
                                                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                                                {/* Premium */}
                                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <DollarSign className="h-5 w-5 text-green-600" />
                                                                        <span className="text-sm font-semibold text-gray-700">Monthly Premium</span>
                                                                    </div>
                                                                    <p className="text-3xl font-bold text-green-600">₹{rec.policy?.premium}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">per month</p>
                                                                </div>

                                                                {/* Term */}
                                                                {rec.policy?.term_months && (
                                                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-200">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Calendar className="h-5 w-5 text-purple-600" />
                                                                            <span className="text-sm font-semibold text-gray-700">Policy Term</span>
                                                                        </div>
                                                                        <p className="text-3xl font-bold text-purple-600">{rec.policy.term_months}</p>
                                                                        <p className="text-xs text-gray-600 mt-1">months</p>
                                                                    </div>
                                                                )}

                                                                {/* Deductible */}
                                                                {rec.policy?.deductible && (
                                                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <Shield className="h-5 w-5 text-blue-600" />
                                                                            <span className="text-sm font-semibold text-gray-700">Deductible</span>
                                                                        </div>
                                                                        <p className="text-3xl font-bold text-blue-600">₹{rec.policy.deductible}</p>
                                                                        <p className="text-xs text-gray-600 mt-1">per claim</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Coverage Highlights */}
                                                            {rec.policy?.coverage && Object.keys(rec.policy.coverage).length > 0 && (
                                                                <div className="mb-6">
                                                                    <h4 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                                        Coverage Highlights
                                                                    </h4>
                                                                    <div className="grid md:grid-cols-2 gap-3">
                                                                        {Object.entries(rec.policy.coverage).slice(0, 6).map(([key, value]) => (
                                                                            <div key={key} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                                                                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                                                <div className="flex-1">
                                                                                    <p className="font-semibold text-gray-900 text-sm">{key}</p>
                                                                                    <p className="text-xs text-gray-600">{value}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                    {Object.keys(rec.policy.coverage).length > 6 && (
                                                                        <p className="text-sm text-blue-600 mt-3 font-medium">
                                                                            +{Object.keys(rec.policy.coverage).length - 6} more coverage benefits
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Action Buttons */}
                                                            <div className="flex flex-wrap gap-3">
                                                                <Link
                                                                    to={`/policies/${rec.policy?.id}`}
                                                                    className="btn-primary flex items-center gap-2 shimmer-effect"
                                                                >
                                                                    <Info className="h-4 w-4" />
                                                                    View Complete Details
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </Link>
                                                                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                                                                    <Star className="h-4 w-4" />
                                                                    Apply Now
                                                                </button>
                                                                <Link
                                                                    to={`/policies/compare?ids=${rec.policy?.id}`}
                                                                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2"
                                                                >
                                                                    <TrendingUp className="h-4 w-4" />
                                                                    Compare Policies
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bottom CTA */}
                        <div className="glass-effect rounded-3xl p-8 text-center mt-8 animate-scale-in">
                            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Can't find what you're looking for?</h3>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                Update your preferences to get more personalized recommendations, or browse our complete policy catalog.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/preferences" className="btn-primary">
                                    <Target className="h-4 w-4 mr-2" />
                                    Update Preferences
                                </Link>
                                <Link to="/policies" className="btn-secondary">
                                    Browse All Policies
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;
