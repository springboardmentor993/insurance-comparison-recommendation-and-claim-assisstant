import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../api';
import {
    Shield, TrendingUp, AlertTriangle, FileText,
    ExternalLink, Eye, CheckCircle, XCircle, Clock,
    Loader, RefreshCw, Users, BarChart3, Activity,
    Search, IndianRupee, ChevronRight, Inbox,
    Home, ShieldCheck, X, Download, Calendar,
    CheckSquare, Ban, CreditCard, ArrowLeft, Filter
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

/* ─── Constants ─────────────────────────────────────────────────────── */
const STATUS_CFG = {
    draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
    submitted: { label: 'Submitted', cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    under_review: { label: 'Under Review', cls: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', border: 'border-yellow-200' },
    approved: { label: 'Approved', cls: 'bg-green-100 text-green-700', dot: 'bg-green-500', border: 'border-green-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
    paid: { label: 'Paid', cls: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', border: 'border-purple-200' },
};

const NAV = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'claims', label: 'Claims', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'fraud', label: 'Fraud Flags', icon: AlertTriangle },
    { id: 'logs', label: 'Activity', icon: Activity },
];

/* ─── Helpers ────────────────────────────────────────────────────────── */
const StatusBadge = ({ status, large }) => {
    const cfg = STATUS_CFG[status] || STATUS_CFG.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${large ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'} ${cfg.cls}`}>
            <span className={`rounded-full ${large ? 'h-2 w-2' : 'h-1.5 w-1.5'} ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, sub, gradient }) => (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${gradient} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 relative">
            <Icon className="h-6 w-6" />
        </div>
        <p className="text-3xl font-bold relative">{value}</p>
        <p className="text-white/80 text-sm mt-1 relative">{label}</p>
        {sub && <p className="text-white/60 text-xs mt-0.5 relative">{sub}</p>}
    </div>
);

/* ─── Claim Review Panel (full-screen modal) ─────────────────────────── */
const ClaimReviewPanel = ({ claim, onClose, onStatusChange }) => {
    const [docs, setDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [updatingTo, setUpdatingTo] = useState(null);
    const [note, setNote] = useState('');

    useEffect(() => {
        loadDocs();
    }, [claim.id]);

    const loadDocs = async () => {
        setDocsLoading(true);
        try {
            const res = await adminAPI.getClaimDocuments(claim.id);
            setDocs(res.data);
        } catch { /* silent */ }
        finally { setDocsLoading(false); }
    };

    const changeStatus = async (newStatus) => {
        setUpdating(true);
        setUpdatingTo(newStatus);
        try {
            await adminAPI.updateClaimStatus(claim.id, newStatus);
            onStatusChange(claim.id, newStatus);
            onClose();
        } catch { /* silent */ }
        finally { setUpdating(false); setUpdatingTo(null); }
    };

    const cfg = STATUS_CFG[claim.status] || STATUS_CFG.draft;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Panel — slides in from right */}
            <div className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-6 py-5 flex items-start justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShieldCheck className="h-4 w-4 text-indigo-400" />
                            <span className="text-indigo-300 text-xs font-semibold uppercase tracking-widest">Admin Claim Review</span>
                        </div>
                        <h2 className="text-xl font-bold">{claim.claim_number}</h2>
                        <p className="text-slate-300 text-sm mt-0.5">
                            {claim.user_policy?.policy?.title || 'Insurance Policy'} · {claim.claim_type}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={claim.status} large />
                        <button onClick={onClose} className="h-9 w-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto">

                    {/* Claim Details */}
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Claim Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                ['Claim Number', claim.claim_number],
                                ['Claim Type', claim.claim_type],
                                ['Incident Date', claim.incident_date ? new Date(claim.incident_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
                                ['Filed On', new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                                ['Policy', claim.user_policy?.policy?.title || '—'],
                                ['Policy Number', claim.user_policy?.policy_number || '—'],
                            ].map(([k, v]) => (
                                <div key={k} className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{k}</p>
                                    <p className="text-gray-900 font-semibold text-sm capitalize">{v}</p>
                                </div>
                            ))}
                        </div>

                        {/* Amount */}
                        <div className="mt-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wide mb-0.5">Amount Claimed</p>
                                <p className="text-3xl font-bold text-indigo-700">₹{Number(claim.amount_claimed).toLocaleString()}</p>
                            </div>
                            <IndianRupee className="h-10 w-10 text-indigo-200" />
                        </div>

                        {/* Description */}
                        {claim.description && (
                            <div className="mt-4 bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Incident Description</p>
                                <p className="text-gray-700 text-sm leading-relaxed">{claim.description}</p>
                            </div>
                        )}
                    </div>

                    {/* S3 Documents — Admin Only */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Eye className="h-4 w-4 text-indigo-600" />
                            <h3 className="text-sm font-bold text-gray-800">Submitted Documents</h3>
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                🔒 Admin Only
                            </span>
                        </div>

                        {docsLoading ? (
                            <div className="flex items-center gap-3 text-gray-400 py-6 justify-center">
                                <Loader className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading documents from S3...</span>
                            </div>
                        ) : docs.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-400 text-sm">No documents uploaded for this claim</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {docs.map(doc => (
                                    <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                                <FileText className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{doc.doc_type}</p>
                                                <p className="text-xs text-gray-400">
                                                    Uploaded {new Date(doc.uploaded_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View File
                                        </a>
                                    </div>
                                ))}
                                <p className="text-xs text-gray-400 text-center mt-2">
                                    📁 {docs.length} document{docs.length !== 1 ? 's' : ''} stored in AWS S3 · Links expire in 1 hour
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Review Actions */}
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Review Decision</h3>

                        <div className="space-y-3">
                            {/* Approve */}
                            <button
                                disabled={updating || claim.status === 'approved'}
                                onClick={() => changeStatus('approved')}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${claim.status === 'approved'
                                    ? 'bg-green-600 text-white border-green-600 cursor-default'
                                    : 'bg-white border-green-200 text-green-700 hover:bg-green-50 hover:border-green-400'
                                    } disabled:opacity-60`}
                            >
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-bold">Approve Claim</p>
                                        <p className="text-xs opacity-70 font-normal">Mark this claim as approved</p>
                                    </div>
                                </div>
                                {updatingTo === 'approved' && <Loader className="h-4 w-4 animate-spin" />}
                                {claim.status === 'approved' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                            </button>

                            {/* Under Review */}
                            <button
                                disabled={updating || claim.status === 'under_review'}
                                onClick={() => changeStatus('under_review')}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${claim.status === 'under_review'
                                    ? 'bg-yellow-500 text-white border-yellow-500 cursor-default'
                                    : 'bg-white border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400'
                                    } disabled:opacity-60`}
                            >
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-bold">Mark Under Review</p>
                                        <p className="text-xs opacity-70 font-normal">Claim is being actively reviewed</p>
                                    </div>
                                </div>
                                {updatingTo === 'under_review' && <Loader className="h-4 w-4 animate-spin" />}
                                {claim.status === 'under_review' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                            </button>

                            {/* Mark Paid */}
                            <button
                                disabled={updating || claim.status === 'paid'}
                                onClick={() => changeStatus('paid')}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${claim.status === 'paid'
                                    ? 'bg-purple-600 text-white border-purple-600 cursor-default'
                                    : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-400'
                                    } disabled:opacity-60`}
                            >
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-bold">Mark as Paid</p>
                                        <p className="text-xs opacity-70 font-normal">Payment has been disbursed</p>
                                    </div>
                                </div>
                                {updatingTo === 'paid' && <Loader className="h-4 w-4 animate-spin" />}
                                {claim.status === 'paid' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                            </button>

                            {/* Reject */}
                            <button
                                disabled={updating || claim.status === 'rejected'}
                                onClick={() => changeStatus('rejected')}
                                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 font-semibold text-sm transition-all ${claim.status === 'rejected'
                                    ? 'bg-red-600 text-white border-red-600 cursor-default'
                                    : 'bg-white border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400'
                                    } disabled:opacity-60`}
                            >
                                <div className="flex items-center gap-3">
                                    <XCircle className="h-5 w-5" />
                                    <div className="text-left">
                                        <p className="font-bold">Reject Claim</p>
                                        <p className="text-xs opacity-70 font-normal">Deny this claim request</p>
                                    </div>
                                </div>
                                {updatingTo === 'rejected' && <Loader className="h-4 w-4 animate-spin" />}
                                {claim.status === 'rejected' && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Main Admin Component ───────────────────────────────────────────── */
const Admin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);

    const [claimStats, setClaimStats] = useState(null);
    const [policyStats, setPolicyStats] = useState(null);
    const [allClaims, setAllClaims] = useState([]);
    const [fraudFlags, setFraudFlags] = useState([]);
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);

    const [claimSearch, setClaimSearch] = useState('');
    const [claimStatusFilter, setClaimStatusFilter] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [fraudSeverity, setFraudSeverity] = useState('');

    const loadData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [statsRes, policyRes, claimsRes, fraudRes, usersRes, logsRes] = await Promise.all([
                adminAPI.getClaimStats(),
                adminAPI.getPolicyStats(),
                adminAPI.getAllClaims({ limit: 200 }),
                adminAPI.getFraudFlags({ limit: 50 }),
                adminAPI.getUsers({ limit: 100 }),
                adminAPI.getLogs({ limit: 50 }),
            ]);
            setClaimStats(statsRes.data);
            setPolicyStats(policyRes.data);
            setAllClaims(claimsRes.data);
            setFraudFlags(fraudRes.data);
            setUsers(usersRes.data);
            setLogs(logsRes.data);
        } catch (e) {
            console.error('Admin load failed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const handleStatusChange = (id, status) => {
        setAllClaims(prev => prev.map(c => c.id === id ? { ...c, status } : c));
        if (selectedClaim?.id === id) setSelectedClaim(prev => ({ ...prev, status }));
    };

    const filteredClaims = allClaims.filter(c => {
        const matchStatus = !claimStatusFilter || c.status === claimStatusFilter;
        const q = claimSearch.toLowerCase();
        const matchSearch = !q || c.claim_number?.toLowerCase().includes(q)
            || c.claim_type?.toLowerCase().includes(q)
            || c.user_policy?.policy?.title?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const filteredUsers = users.filter(u => {
        const q = userSearch.toLowerCase();
        return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    });

    const filteredFraud = fraudFlags.filter(f => !fraudSeverity || f.severity === fraudSeverity);

    const handleExportClaims = () => {
        if (filteredClaims.length === 0) return;

        const headers = ["Claim Number", "Policy", "User Email", "Type", "Amount", "Status", "Filed Date"];
        const rows = filteredClaims.map(c => [
            c.claim_number,
            c.user_policy?.policy?.title || "N/A",
            c.user_policy?.user?.email || "N/A",
            c.claim_type,
            c.amount_claimed,
            c.status,
            new Date(c.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `claims_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <ShieldCheck className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <p className="text-slate-400 font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* ── Sidebar ── */}
            <aside className="w-64 bg-gradient-to-b from-slate-900 to-indigo-950 text-white flex flex-col shrink-0 shadow-2xl">
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                            <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm">Admin Panel</p>
                            <p className="text-indigo-300 text-xs">InsureAI Platform</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-b border-white/10">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                        <div className="h-9 w-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                            {user?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                }`}>
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                            {id === 'claims' && allClaims.filter(c => c.status === 'submitted').length > 0 && (
                                <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {allClaims.filter(c => c.status === 'submitted').length}
                                </span>
                            )}
                            {id === 'fraud' && fraudFlags.length > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {fraudFlags.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <button onClick={() => navigate('/dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-all">
                        <Home className="h-4 w-4" /> Back to App
                    </button>
                    <button onClick={() => loadData(true)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-indigo-300 hover:bg-white/10 hover:text-white transition-all">
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className="flex-1 overflow-auto">
                {/* Top bar */}
                <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="h-6 w-6 text-indigo-600" />
                            Admin System Dashboard
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-700 text-xs font-semibold">Live</span>
                    </div>
                </div>

                <div className="p-8">

                    {/* ══ OVERVIEW ══ */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                <StatCard icon={FileText} label="Total Claims" value={claimStats?.total_claims ?? 0}
                                    sub={`${claimStats?.pending_claims ?? 0} pending`}
                                    gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
                                <StatCard icon={IndianRupee} label="Total Claimed" value={`₹${((claimStats?.total_amount_claimed ?? 0) / 1000).toFixed(0)}K`}
                                    sub={`₹${((claimStats?.total_amount_approved ?? 0) / 1000).toFixed(0)}K approved`}
                                    gradient="bg-gradient-to-br from-emerald-500 to-green-700" />
                                <StatCard icon={Users} label="Registered Users" value={users.length}
                                    sub={`${users.filter(u => !u.is_admin).length} customers`}
                                    gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
                                <StatCard icon={AlertTriangle} label="Fraud Flags" value={claimStats?.fraud_flags_count ?? 0}
                                    sub="Requires attention"
                                    gradient="bg-gradient-to-br from-rose-500 to-red-700" />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                {[
                                    { label: 'Approved', value: claimStats?.approved_claims ?? 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
                                    { label: 'Rejected', value: claimStats?.rejected_claims ?? 0, icon: XCircle, color: 'text-red-600 bg-red-50' },
                                    { label: 'Active Policies', value: policyStats?.active_policies ?? 0, icon: Shield, color: 'text-indigo-600 bg-indigo-50' },
                                    { label: 'Monthly Revenue', value: `₹${((policyStats?.total_premium_revenue ?? 0) / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
                                ].map(({ label, value, icon: Icon, color }) => (
                                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                                            <p className="text-gray-500 text-sm">{label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Policy Distribution */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-indigo-600" /> Policy Distribution
                                </h3>
                                {policyStats?.policies_by_type && Object.keys(policyStats.policies_by_type).length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {Object.entries(policyStats.policies_by_type).map(([type, count]) => {
                                            const total = Object.values(policyStats.policies_by_type).reduce((a, b) => a + b, 0);
                                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                            return (
                                                <div key={type} className="text-center p-5 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100">
                                                    <p className="text-3xl font-bold text-indigo-600">{count}</p>
                                                    <p className="text-xs text-gray-500 capitalize mt-1">{type}</p>
                                                    <div className="mt-2 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <p className="text-xs text-indigo-400 mt-1">{pct}%</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-center py-8">No policy data available</p>
                                )}
                            </div>

                            {/* Pending claims */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-orange-500" /> Pending Review
                                    </h3>
                                    <button onClick={() => setActiveTab('claims')}
                                        className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1">
                                        View All <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                                {allClaims.filter(c => c.status === 'submitted').length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                        <p>All caught up! No pending claims.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {allClaims.filter(c => c.status === 'submitted').slice(0, 5).map(claim => (
                                            <div key={claim.id}
                                                className="flex items-center justify-between p-3 bg-orange-50 border border-orange-100 rounded-xl cursor-pointer hover:border-orange-300 transition-colors"
                                                onClick={() => setSelectedClaim(claim)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{claim.claim_number}</p>
                                                        <p className="text-xs text-gray-500">{claim.claim_type} · {new Date(claim.created_at).toLocaleDateString('en-IN')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-bold text-gray-900 text-sm">₹{Number(claim.amount_claimed).toLocaleString()}</p>
                                                    <span className="text-xs text-indigo-600 font-semibold">Review →</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══ CLAIMS ══ */}
                    {activeTab === 'claims' && (
                        <div className="space-y-5">
                            {/* Filters */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="relative flex-1 min-w-48">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input type="text" placeholder="Search claim number, type, policy..."
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                            value={claimSearch} onChange={e => setClaimSearch(e.target.value)} />
                                    </div>
                                    <select value={claimStatusFilter} onChange={e => setClaimStatusFilter(e.target.value)}
                                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
                                        <option value="">All Statuses</option>
                                        {Object.entries(STATUS_CFG).map(([s, cfg]) => (
                                            <option key={s} value={s}>{cfg.label}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleExportClaims}
                                        disabled={filteredClaims.length === 0}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export CSV
                                    </button>
                                    <span className="text-sm text-gray-400 font-medium ml-auto">{filteredClaims.length} claims</span>
                                </div>
                            </div>

                            {/* Status pills */}
                            <div className="flex gap-2 flex-wrap">
                                {Object.entries(STATUS_CFG).map(([s, cfg]) => {
                                    const count = allClaims.filter(c => c.status === s).length;
                                    if (count === 0) return null;
                                    return (
                                        <button key={s} onClick={() => setClaimStatusFilter(claimStatusFilter === s ? '' : s)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${claimStatusFilter === s ? 'ring-2 ring-offset-1 ring-indigo-400' : ''
                                                } ${cfg.cls} border-current/20`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                            {cfg.label} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Claims table */}
                            {filteredClaims.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                    <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No claims found</p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {['Claim', 'Policy', 'Type', 'Amount', 'Status', 'Filed', 'Action'].map(h => (
                                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredClaims.map(claim => (
                                                <tr key={claim.id} className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                                                    onClick={() => setSelectedClaim(claim)}>
                                                    <td className="px-5 py-4">
                                                        <p className="font-mono text-xs text-gray-500">{claim.claim_number}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-semibold text-gray-900 max-w-32 truncate">
                                                            {claim.user_policy?.policy?.title || '—'}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm text-gray-600 capitalize">{claim.claim_type}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-sm font-bold text-gray-900">₹{Number(claim.amount_claimed).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={claim.status} />
                                                    </td>
                                                    <td className="px-5 py-4 text-xs text-gray-400">
                                                        {new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <button className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors group-hover:bg-indigo-100">
                                                            <Eye className="h-3.5 w-3.5" /> Review
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ USERS ══ */}
                    {activeTab === 'users' && (
                        <div className="space-y-5">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <div className="relative max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" placeholder="Search by name or email..."
                                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                        value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-violet-600" /> All Users
                                    </h3>
                                    <span className="text-sm text-gray-400">{filteredUsers.length} users</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {['User', 'Email', 'Role', 'Policies', 'Claims', 'Joined'].map(h => (
                                                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${u.is_admin ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                                                }`}>
                                                                {u.name?.[0]?.toUpperCase() || '?'}
                                                            </div>
                                                            <span className="font-semibold text-gray-900 text-sm">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.is_admin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {u.is_admin ? '🛡 Admin' : 'Customer'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{u.policy_count}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">{u.claim_count}</td>
                                                    <td className="px-6 py-4 text-xs text-gray-400">
                                                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredUsers.length === 0 && (
                                        <div className="text-center py-12 text-gray-400">
                                            <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                            <p>No users found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ══ FRAUD FLAGS ══ */}
                    {activeTab === 'fraud' && (
                        <div className="space-y-5">
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 flex-wrap">
                                <Filter className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-600">Severity:</span>
                                {['', 'high', 'medium', 'low'].map(s => (
                                    <button key={s} onClick={() => setFraudSeverity(s)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${fraudSeverity === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}>
                                        {s || 'All'}
                                    </button>
                                ))}
                                <span className="ml-auto text-sm text-gray-400">{filteredFraud.length} flags</span>
                            </div>
                            {filteredFraud.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                                    <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No fraud flags detected</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredFraud.map(flag => (
                                        <div key={flag.id} className={`bg-white border-2 rounded-2xl p-5 shadow-sm ${flag.severity === 'high' ? 'border-red-200' : flag.severity === 'medium' ? 'border-yellow-200' : 'border-blue-200'
                                            }`}>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${flag.severity === 'high' ? 'bg-red-100' : flag.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                                                        }`}>
                                                        <AlertTriangle className={`h-5 w-5 ${flag.severity === 'high' ? 'text-red-600' : flag.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                                                            }`} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${flag.severity === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                flag.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                                    'bg-blue-100 text-blue-700 border-blue-200'
                                                                }`}>{flag.severity}</span>
                                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{flag.rule_code}</span>
                                                        </div>
                                                        <p className="text-gray-800 font-medium text-sm">{flag.details}</p>
                                                        <p className="text-xs text-gray-400 mt-1">Claim #{flag.claim_id} · {new Date(flag.created_at).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => {
                                                    const c = allClaims.find(cl => cl.id === flag.claim_id);
                                                    if (c) setSelectedClaim(c);
                                                    else { setClaimSearch(String(flag.claim_id)); setActiveTab('claims'); }
                                                }} className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 shrink-0 flex items-center gap-1">
                                                    Review Claim <ChevronRight className="h-3 w-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══ ACTIVITY LOG ══ */}
                    {activeTab === 'logs' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-600" /> Admin Activity Log
                                </h3>
                                <p className="text-gray-400 text-sm mt-0.5">All admin actions are recorded here</p>
                            </div>
                            {logs.length === 0 ? (
                                <div className="text-center py-16 text-gray-400">
                                    <Activity className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p>No activity recorded yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {logs.map((log, i) => (
                                        <div key={log.id || i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                                <Activity className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                                    {log.target_type && (
                                                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded font-medium">
                                                            {log.target_type} #{log.target_id}
                                                        </span>
                                                    )}
                                                    <span>{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* ── Claim Review Panel ── */}
            {selectedClaim && (
                <ClaimReviewPanel
                    claim={selectedClaim}
                    onClose={() => setSelectedClaim(null)}
                    onStatusChange={handleStatusChange}
                />
            )}
        </div>
    );
};

export default Admin;
