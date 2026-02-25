import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api';
import {
    AlertTriangle,
    Shield,
    TrendingUp,
    Users,
    Clock,
    DollarSign,
    FileText,
    Filter,
    Search,
    Eye
} from 'lucide-react';

const FraudDashboard = () => {
    const [fraudFlags, setFraudFlags] = useState([]);
    const [stats, setStats] = useState({
        totalFlags: 0,
        highSeverity: 0,
        mediumSeverity: 0,
        lowSeverity: 0,
        totalAmount: 0
    });
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFraudData();
    }, [filter]);

    const fetchFraudData = async () => {
        try {
            const response = await adminAPI.getFraudFlags({ severity: filter === 'all' ? null : filter });
            setFraudFlags(response.data);

            // Calculate stats
            const high = response.data.filter(f => f.severity === 'high').length;
            const medium = response.data.filter(f => f.severity === 'medium').length;
            const low = response.data.filter(f => f.severity === 'low').length;

            setStats({
                totalFlags: response.data.length,
                highSeverity: high,
                mediumSeverity: medium,
                lowSeverity: low,
                totalAmount: response.data.reduce((sum, f) => sum + (f.claim?.amount_claimed || 0), 0)
            });
        } catch (err) {
            console.error('Failed to fetch fraud flags:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'from-red-500 to-pink-600';
            case 'medium': return 'from-orange-500 to-yellow-500';
            case 'low': return 'from-blue-500 to-cyan-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getSeverityBadge = (severity) => {
        const colors = {
            high: 'bg-red-500/20 text-red-300 border-red-500/30',
            medium: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
            low: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
        return colors[severity] || colors.low;
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animated-bg-pattern">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 animate-slide-up">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-white mb-1">Fraud Detection Dashboard</h1>
                            <p className="text-white/70 text-lg">AI-powered claim verification and fraud analysis</p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        label="Total Fraud Flags"
                        value={stats.totalFlags}
                        icon={AlertTriangle}
                        gradient="from-purple-500 to-pink-500"
                        delay="0s"
                    />
                    <StatCard
                        label="High Severity"
                        value={stats.highSeverity}
                        icon={Shield}
                        gradient="from-red-500 to-pink-600"
                        delay="0.1s"
                    />
                    <StatCard
                        label="Medium Severity"
                        value={stats.mediumSeverity}
                        icon={TrendingUp}
                        gradient="from-orange-500 to-yellow-500"
                        delay="0.2s"
                    />
                    <StatCard
                        label="Flagged Amount"
                        value={`₹${(stats.totalAmount / 1000).toFixed(1)}k`}
                        icon={DollarSign}
                        gradient="from-green-500 to-emerald-500"
                        delay="0.3s"
                    />
                </div>

                {/* Filters */}
                <div className="glass-effect p-6 rounded-2xl mb-8 animate-scale-in">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-white" />
                            <span className="text-white font-semibold">Filter by Severity:</span>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'high', 'medium', 'low'].map((severity) => (
                                <button
                                    key={severity}
                                    onClick={() => setFilter(severity)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filter === severity
                                        ? 'bg-white text-purple-600 shadow-lg'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Fraud Flags List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="glass-effect p-12 rounded-3xl text-center">
                            <div className="spinner mx-auto mb-4"></div>
                            <p className="text-white">Loading fraud detection data...</p>
                        </div>
                    ) : fraudFlags.length === 0 ? (
                        <div className="glass-effect p-12 rounded-3xl text-center animate-scale-in">
                            <Shield className="h-20 w-20 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">No Fraud Detected</h3>
                            <p className="text-white/70">All claims are clean! No suspicious activity found.</p>
                        </div>
                    ) : (
                        fraudFlags.map((flag, index) => (
                            <div
                                key={flag.id}
                                className="glass-effect p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`h-16 w-16 bg-gradient-to-br ${getSeverityColor(flag.severity)} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <AlertTriangle className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-white">Claim #{flag.claim_id}</h3>
                                                <span className={`badge border ${getSeverityBadge(flag.severity)}`}>
                                                    {flag.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-white/80 mb-3">{flag.details}</p>
                                            <div className="flex items-center gap-6 text-sm text-white/60">
                                                <div className="flex items-center gap-1">
                                                    <FileText className="h-4 w-4" />
                                                    <span>Rule: {flag.rule_code}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{new Date(flag.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/admin/claims/${flag.claim_id}`}
                                        className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Review
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Document Verification Info */}
                <div className="mt-10 glass-effect p-8 rounded-3xl animate-fade-in">
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        Document Verification Process
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 text-white/80">
                        <div className="bg-white/10 p-6 rounded-xl">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-bold mb-2">Document Upload</h4>
                            <p className="text-sm">All uploaded documents are scanned for duplicates across claims</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl">
                            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-bold mb-2">Pattern Analysis</h4>
                            <p className="text-sm">AI algorithms detect suspicious patterns in claim timing and amounts</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-xl">
                            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h4 className="font-bold mb-2">Risk Scoring</h4>
                            <p className="text-sm">Each claim receives a fraud risk score for admin review</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, gradient, delay }) => (
    <div className="card-hover animate-scale-in" style={{ animationDelay: delay }}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-white/70 text-sm font-medium mb-1">{label}</p>
                <p className="text-4xl font-bold text-white">{value}</p>
            </div>
            <div className={`h-16 w-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all duration-300`}>
                <Icon className="h-8 w-8 text-white" strokeWidth={2.5} />
            </div>
        </div>
    </div>
);

export default FraudDashboard;
