import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import claimService from '../../services/claimService';
import { useAuth } from '../../contexts/AuthContext';

export const ClaimDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaimDetails();
    }, [id]);

    const fetchClaimDetails = async () => {
        setLoading(true);
        try {
            const data = await claimService.getClaimDetails(id);
            setClaim(data);
        } catch (err) {
            console.error('Failed to load claim details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        const statusMap = {
            submitted: 'info',
            under_review: 'warning',
            approved: 'success',
            rejected: 'danger',
            paid: 'success',
        };
        return statusMap[status] || 'default';
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

    const statusTimeline = [
        { status: 'submitted', label: 'Submitted' },
        { status: 'under_review', label: 'Under Review' },
        { status: 'approved', label: 'Approved' },
        { status: 'paid', label: 'Paid' },
    ];

    const getCurrentStepIndex = () => {
        if (!claim) return 0;
        return statusTimeline.findIndex(s => s.status === claim.status);
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
                <Button variant="outline" onClick={() => navigate('/claims')} className="mt-4">
                    Back to Claims
                </Button>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex();

    return (
        <div className="space-y-6 animate-fade-in">
            <Button variant="ghost" onClick={() => navigate('/claims')}>
                <ArrowLeft size={20} />
                Back to Claims
            </Button>

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">{claim.claim_number}</h1>
                    <p className="text-slate-400 mt-1">{claim.policy_title}</p>
                </div>
                <Badge variant={getStatusVariant(claim.status)} size="lg">
                    {claim.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            {/* Status Timeline */}
            {claim.status !== 'rejected' && (
                <Card glass hover={false}>
                    <h2 className="text-lg font-bold text-white mb-6">Claim Status</h2>
                    <div className="flex items-center justify-between">
                        {statusTimeline.map((step, index) => (
                            <div key={step.status} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${index <= currentStep
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                            }`}
                                    >
                                        {index < currentStep ? '✓' : index + 1}
                                    </div>
                                    <p
                                        className={`text-sm mt-2 ${index === currentStep ? 'text-white font-medium' : 'text-slate-400'
                                            }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                                {index < statusTimeline.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 rounded transition-all ${index < currentStep ? 'bg-green-500' : 'bg-slate-700'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Claim Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4">Claim Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Claim Type:</span>
                                <span className="text-white font-medium capitalize">{claim.claim_type}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Incident Date:</span>
                                <span className="text-white">{formatDate(claim.incident_date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Amount Claimed:</span>
                                <span className="text-white font-bold text-xl">{formatCurrency(claim.amount_claimed)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Filed On:</span>
                                <span className="text-white">{formatDate(claim.created_at)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Documents */}
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4">Uploaded Documents</h2>
                        {claim.documents && claim.documents.length > 0 ? (
                            <div className="space-y-3">
                                {claim.documents.map((doc, index) => (
                                    <div key={doc.id} className="glass-dark rounded-lg p-4 flex items-center gap-4">
                                        <FileText className="h-8 w-8 text-blue-400" />
                                        <div className="flex-1">
                                            <p className="text-white font-medium capitalize">{doc.doc_type.replace('_', ' ')}</p>
                                            <p className="text-sm text-slate-400">
                                                Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge variant="info" size="sm">PDF</Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 text-center py-4">No documents uploaded</p>
                        )}
                    </Card>

                    {/* Fraud Flags - Only visible to admins */}
                    {user?.role === 'admin' && claim.fraud_flags && claim.fraud_flags.length > 0 && (
                        <Card glass hover={false} className="border-2 border-red-500/30">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-red-400 mb-4">Fraud Alerts</h2>
                                    <div className="space-y-3">
                                        {claim.fraud_flags.map((flag) => (
                                            <div key={flag.id} className="bg-red-500/10 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-medium text-white">{flag.rule_code}</span>
                                                    <Badge variant="danger" size="sm">{flag.severity}</Badge>
                                                </div>
                                                {flag.details && (
                                                    <div className="text-sm text-slate-300 space-y-1">
                                                        {Object.entries(flag.details).map(([key, value]) => (
                                                            <p key={key}>
                                                                <span className="text-slate-400">{key.replace(/_/g, ' ')}: </span>
                                                                {Array.isArray(value) ? value.join(', ') : String(value)}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Policy Details Sidebar */}
                <div>
                    <Card glass hover={false}>
                        <h2 className="text-lg font-bold text-white mb-4">Policy Details</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-slate-400 text-sm">Policy Title</p>
                                <p className="text-white font-medium">{claim.policy_title}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Provider</p>
                                <p className="text-white">{claim.provider_name}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetails;
