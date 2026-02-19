import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle,
    Clock, Download, Shield, User, Calendar, IndianRupee
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import adminService from '../../services/adminService';

const ClaimReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');
    const [showFraudModal, setShowFraudModal] = useState(false);
    const [fraudReason, setFraudReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchClaimData();
    }, [id]);

    const fetchClaimData = async () => {
        setLoading(true);
        try {
            const [claimData, docsData] = await Promise.all([
                adminService.getClaimDetails(id),
                adminService.getClaimDocuments(id),
            ]);
            setClaim(claimData);
            setDocuments(docsData);
        } catch (err) {
            toast.error('Failed to load claim details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(newStatus);
        try {
            const updated = await adminService.updateClaimStatus(id, newStatus, adminNotes || null);
            setClaim(updated);
            setAdminNotes('');
            toast.success(`Claim ${newStatus.replace('_', ' ')} successfully`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update status');
        } finally {
            setActionLoading('');
        }
    };

    const handleFlagFraud = async () => {
        if (!fraudReason.trim()) {
            toast.error('Please provide a reason for fraud flagging');
            return;
        }
        setActionLoading('fraud');
        try {
            const updated = await adminService.flagFraud(id, fraudReason);
            setClaim(updated);
            setShowFraudModal(false);
            setFraudReason('');
            toast.success('Claim flagged as fraudulent and rejected');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to flag claim');
        } finally {
            setActionLoading('');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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

    const getSeverityVariant = (severity) => {
        const map = { low: 'warning', medium: 'warning', high: 'danger', critical: 'danger' };
        return map[severity] || 'default';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400">Claim not found</p>
                <Button variant="outline" onClick={() => navigate('/admin')} className="mt-4">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin')}>
                        <ArrowLeft size={20} />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold gradient-text">{claim.claim_number}</h1>
                        <p className="text-slate-400 text-sm">Claim Review</p>
                    </div>
                </div>
                <Badge variant={getStatusVariant(claim.status)} size="lg">
                    {claim.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column — Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Claim Info */}
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-blue-400" />
                            Claim Information
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-dark rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Claimant</p>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <User size={14} />
                                    {claim.user_name || 'N/A'}
                                </p>
                                <p className="text-xs text-slate-400">{claim.user_email}</p>
                            </div>
                            <div className="glass-dark rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Claim Type</p>
                                <p className="text-white font-medium capitalize">{claim.claim_type}</p>
                            </div>
                            <div className="glass-dark rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Incident Date</p>
                                <p className="text-white font-medium flex items-center gap-2">
                                    <Calendar size={14} />
                                    {formatDate(claim.incident_date)}
                                </p>
                            </div>
                            <div className="glass-dark rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Amount Claimed</p>
                                <p className="text-xl font-bold text-white flex items-center gap-1">
                                    <IndianRupee size={16} />
                                    {formatCurrency(claim.amount_claimed).replace('₹', '')}
                                </p>
                            </div>
                            <div className="glass-dark rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Policy</p>
                                <p className="text-white font-medium">{claim.policy_title || 'N/A'}</p>
                            </div>
                            <div className="glass-dark rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Filed On</p>
                                <p className="text-white font-medium">{formatDate(claim.created_at)}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Documents Section */}
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-blue-400" />
                            Uploaded Documents
                            <Badge variant="info" size="sm">{documents.length}</Badge>
                        </h2>
                        {documents.length > 0 ? (
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="glass-dark rounded-lg p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <FileText className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-white font-medium capitalize">
                                                    {doc.doc_type.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Uploaded: {new Date(doc.uploaded_at).toLocaleDateString('en-IN')}
                                                </p>
                                            </div>
                                        </div>
                                        {doc.download_url && (
                                            <a
                                                href={doc.download_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Download size={16} />
                                                Download
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-6">No documents uploaded for this claim</p>
                        )}
                    </Card>

                    {/* Fraud Flags */}
                    {claim.fraud_flags && claim.fraud_flags.length > 0 && (
                        <Card glass hover={false} className="border-2 border-red-500/30">
                            <h2 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Fraud Alerts ({claim.fraud_flags.length})
                            </h2>
                            <div className="space-y-3">
                                {claim.fraud_flags.map((flag, index) => (
                                    <div key={flag.id || index} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-mono text-sm text-white font-medium">
                                                {flag.rule_code}
                                            </span>
                                            <Badge variant={getSeverityVariant(flag.severity)} size="sm">
                                                {flag.severity}
                                            </Badge>
                                        </div>
                                        {flag.details && (
                                            <div className="text-sm text-slate-300 space-y-1">
                                                {Object.entries(flag.details).map(([key, value]) => (
                                                    <p key={key}>
                                                        <span className="text-slate-400">
                                                            {key.replace(/_/g, ' ')}:{' '}
                                                        </span>
                                                        {Array.isArray(value) ? value.join(', ') : String(value)}
                                                    </p>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column — Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4">Actions</h2>
                        <div className="space-y-3">
                            {/* Admin Notes */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Admin Notes (optional)</label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes for this action..."
                                    rows={3}
                                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            {claim.status !== 'approved' && claim.status !== 'paid' && (
                                <Button
                                    variant="primary"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                                    onClick={() => handleStatusUpdate('approved')}
                                    loading={actionLoading === 'approved'}
                                >
                                    <CheckCircle size={18} />
                                    Approve Claim
                                </Button>
                            )}

                            {claim.status === 'approved' && (
                                <Button
                                    variant="primary"
                                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                                    onClick={() => handleStatusUpdate('paid')}
                                    loading={actionLoading === 'paid'}
                                >
                                    <IndianRupee size={18} />
                                    Mark as Paid
                                </Button>
                            )}

                            {claim.status !== 'rejected' && (
                                <Button
                                    variant="primary"
                                    className="w-full bg-red-600 hover:bg-red-500"
                                    onClick={() => handleStatusUpdate('rejected')}
                                    loading={actionLoading === 'rejected'}
                                >
                                    <XCircle size={18} />
                                    Reject Claim
                                </Button>
                            )}

                            {claim.status === 'submitted' && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleStatusUpdate('under_review')}
                                    loading={actionLoading === 'under_review'}
                                >
                                    <Clock size={18} />
                                    Mark Under Review
                                </Button>
                            )}

                            <hr className="border-slate-700" />

                            {/* Fraud Flag */}
                            <Button
                                variant="outline"
                                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                                onClick={() => setShowFraudModal(true)}
                            >
                                <AlertTriangle size={18} />
                                Flag as Fraud
                            </Button>
                        </div>
                    </Card>

                    {/* Policy Info */}
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4">Policy Details</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-slate-400">Policy</p>
                                <p className="text-white font-medium">{claim.policy_title || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Provider</p>
                                <p className="text-white">{claim.provider_name || 'N/A'}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Fraud Flag Modal */}
            {showFraudModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Card glass hover={false} className="w-full max-w-md animate-scale-up">
                        <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                            <AlertTriangle size={22} />
                            Flag Claim as Fraudulent
                        </h2>
                        <p className="text-sm text-slate-400 mb-4">
                            This will automatically <strong className="text-red-400">reject</strong> the claim
                            and create a fraud record.
                        </p>
                        <textarea
                            value={fraudReason}
                            onChange={(e) => setFraudReason(e.target.value)}
                            placeholder="Describe the reason for fraud flagging..."
                            rows={4}
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowFraudModal(false);
                                    setFraudReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 bg-red-600 hover:bg-red-500"
                                onClick={handleFlagFraud}
                                loading={actionLoading === 'fraud'}
                            >
                                Confirm & Reject
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ClaimReview;
