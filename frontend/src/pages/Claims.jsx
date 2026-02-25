import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimAPI } from '../api';
import {
    FileText, Clock, CheckCircle, AlertCircle,
    XCircle, Plus, Eye, Shield, IndianRupee,
    Calendar, ChevronRight, Loader
} from 'lucide-react';

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600', icon: FileText, dot: 'bg-gray-400' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: Clock, dot: 'bg-blue-500' },
    under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle, dot: 'bg-yellow-500' },
    approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle, dot: 'bg-green-500' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle, dot: 'bg-red-500' },
    paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
};

const FILTERS = ['all', 'draft', 'submitted', 'under_review', 'approved', 'rejected'];

const Claims = () => {
    const [claims, setClaims] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaims();
    }, [filter]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const params = filter === 'all' ? {} : { status: filter };
            const response = await claimAPI.getAll(params);
            setClaims(response.data);
        } catch (err) {
            console.error('Failed to fetch claims:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.draft;

    const totalClaimed = claims.reduce((sum, c) => sum + (c.amount_claimed || 0), 0);
    const approvedCount = claims.filter(c => c.status === 'approved' || c.status === 'paid').length;
    const pendingCount = claims.filter(c => c.status === 'submitted' || c.status === 'under_review').length;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animated-bg-pattern">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 animate-slide-up">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-1">My Claims</h1>
                        <p className="text-gray-500">Track and manage all your insurance claims</p>
                    </div>
                    <Link
                        to="/claims/new"
                        className="btn-primary flex items-center gap-2 shimmer-effect"
                    >
                        <Plus className="h-5 w-5" />
                        File New Claim
                    </Link>
                </div>

                {/* Summary Cards */}
                {claims.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8 animate-scale-in">
                        <div className="glass-effect rounded-2xl p-5 bg-white/70">
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Claims</p>
                            <p className="text-3xl font-bold text-gray-900">{claims.length}</p>
                        </div>
                        <div className="glass-effect rounded-2xl p-5 bg-white/70">
                            <p className="text-gray-500 text-sm font-medium mb-1">Total Claimed</p>
                            <p className="text-3xl font-bold text-gray-900">₹{totalClaimed.toLocaleString()}</p>
                        </div>
                        <div className="glass-effect rounded-2xl p-5 bg-white/70">
                            <p className="text-gray-500 text-sm font-medium mb-1">Approved</p>
                            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap animate-fade-in">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${filter === f
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900'
                                }`}
                        >
                            {f === 'all' ? 'All Claims' : f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                {/* Claims List */}
                {loading ? (
                    <div className="glass-effect p-16 rounded-3xl text-center bg-white/60">
                        <Loader className="h-10 w-10 text-primary-500 animate-spin mx-auto mb-3" />
                        <p className="text-gray-500">Loading claims...</p>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="glass-effect p-16 rounded-3xl text-center animate-scale-in bg-white/60">
                        <div className="h-20 w-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No claims found</h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'all' ? 'You have not filed any claims yet.' : `No ${filter.replace('_', ' ')} claims found.`}
                        </p>
                        {filter === 'all' && (
                            <Link to="/claims/new" className="btn-primary inline-flex items-center gap-2">
                                <Plus className="h-5 w-5" />
                                File Your First Claim
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim, index) => {
                            const cfg = getStatusConfig(claim.status);
                            const StatusIcon = cfg.icon;
                            return (
                                <Link
                                    to={`/claims/${claim.id}`}
                                    key={claim.id}
                                    className="block glass-effect rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 animate-slide-up cursor-pointer group bg-white/70 hover:bg-white/90 hover:shadow-lg"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left: Claim Info */}
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                                                <FileText className="h-6 w-6 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                                                        {claim.claim_number}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}></span>
                                                        {cfg.label}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                                    {claim.user_policy?.policy?.title || 'Insurance Policy'}
                                                </h3>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-1">
                                                        <Shield className="h-3.5 w-3.5" />
                                                        {claim.claim_type}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        {new Date(claim.incident_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    {claim.documents?.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3.5 w-3.5" />
                                                            {claim.documents.length} doc{claim.documents.length !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Amount + Arrow */}
                                        <div className="flex items-center gap-4 shrink-0">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 mb-0.5">Amount Claimed</p>
                                                <p className="text-xl font-bold text-gray-900">
                                                    ₹{claim.amount_claimed?.toLocaleString()}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Claims;
