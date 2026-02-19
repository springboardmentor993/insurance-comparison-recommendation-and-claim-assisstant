import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3, Users, FileCheck, FileX, AlertTriangle,
    IndianRupee, Clock, Filter, Eye, ChevronDown
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showFlagged, setShowFlagged] = useState(false);

    useEffect(() => {
        fetchData();
    }, [statusFilter, showFlagged]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, claimsData] = await Promise.all([
                adminService.getStats(),
                adminService.getAllClaims(statusFilter || null, showFlagged),
            ]);
            setStats(statsData);
            setClaims(claimsData);
        } catch (err) {
            console.error('Failed to load admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusVariant = (status) => {
        const map = {
            submitted: 'info',
            under_review: 'warning',
            approved: 'success',
            rejected: 'danger',
            paid: 'success',
        };
        return map[status] || 'default';
    };

    const getSeverityColor = (severity) => {
        const map = {
            low: 'text-yellow-400',
            medium: 'text-orange-400',
            high: 'text-red-400',
            critical: 'text-red-500',
        };
        return map[severity] || 'text-slate-400';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Claims',
            value: stats?.total_claims || 0,
            icon: BarChart3,
            color: 'from-blue-600 to-blue-400',
        },
        {
            label: 'Pending Review',
            value: stats?.pending_claims || 0,
            icon: Clock,
            color: 'from-amber-600 to-amber-400',
        },
        {
            label: 'Approved',
            value: stats?.approved_claims || 0,
            icon: FileCheck,
            color: 'from-emerald-600 to-emerald-400',
        },
        {
            label: 'Rejected',
            value: stats?.rejected_claims || 0,
            icon: FileX,
            color: 'from-red-600 to-red-400',
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-1">Manage and review insurance claims</p>
                </div>
                <Badge variant="info" size="lg">
                    <AlertTriangle size={16} className="mr-1" />
                    Admin Panel
                </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label} glass hover={true}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Amount Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card glass hover={false}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-400">
                            <IndianRupee className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Amount Claimed</p>
                            <p className="text-xl font-bold text-white">
                                {formatCurrency(stats?.total_amount_claimed || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card glass hover={false}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-400">
                            <IndianRupee className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Amount Approved</p>
                            <p className="text-xl font-bold text-white">
                                {formatCurrency(stats?.total_amount_approved || 0)}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Claims Table */}
            <Card glass hover={false}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">All Claims</h2>
                    <div className="flex items-center gap-3">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none pl-3 pr-8 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="">All Statuses</option>
                                <option value="submitted">Submitted</option>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="paid">Paid</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Flagged Filter */}
                        <button
                            onClick={() => setShowFlagged(!showFlagged)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${showFlagged
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                                    : 'bg-slate-800/50 text-slate-400 border border-slate-600 hover:border-slate-500'
                                }`}
                        >
                            <AlertTriangle size={14} />
                            Flagged
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Claim #</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Claimant</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Flags</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                                <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {claims.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-slate-400">
                                        No claims found
                                    </td>
                                </tr>
                            ) : (
                                claims.map((claim) => (
                                    <tr
                                        key={claim.id}
                                        className="border-b border-slate-700/50 hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/admin/claims/${claim.id}`)}
                                    >
                                        <td className="py-3 px-4">
                                            <span className="font-mono text-sm text-blue-400">
                                                {claim.claim_number}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="text-sm text-white">{claim.user_name || 'N/A'}</p>
                                                <p className="text-xs text-slate-400">{claim.user_email || ''}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-slate-300 capitalize">{claim.claim_type}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm font-medium text-white">
                                                {formatCurrency(claim.amount_claimed)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant={getStatusVariant(claim.status)} size="sm">
                                                {claim.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            {claim.fraud_flags && claim.fraud_flags.length > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <AlertTriangle size={14} className="text-red-400" />
                                                    <span className="text-xs text-red-400">
                                                        {claim.fraud_flags.length}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-slate-400">
                                                {new Date(claim.created_at).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/admin/claims/${claim.id}`);
                                                }}
                                            >
                                                <Eye size={16} />
                                                Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
