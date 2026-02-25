import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { claimAPI } from '../api';
import { X, FileText, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const ClaimDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClaimDetails();
    }, [id]);

    const fetchClaimDetails = async () => {
        try {
            const response = await claimAPI.getById(id);
            setClaim(response.data);
        } catch (err) {
            console.error('Failed to fetch claim details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Loading...</div>;
    if (!claim) return <div className="text-white text-center py-20">Claim not found</div>;

    const getStatusColor = (status) => {
        const colors = {
            draft: 'text-gray-400',
            submitted: 'text-blue-400',
            pending: 'text-yellow-400',
            approved: 'text-green-400',
            rejected: 'text-red-400'
        };
        return colors[status] || 'text-white';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-effect w-full max-w-3xl rounded-3xl p-8 relative animate-scale-in max-h-[90vh] overflow-y-auto">
                <button
                    onClick={() => navigate('/claims')}
                    className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-1">
                        Claim Details — {claim.claim_number}
                    </h2>
                </div>

                <div className="space-y-6 text-lg">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="text-white">
                            <span className="font-bold">Policy:</span> {claim.user_policy?.policy?.title || 'Unknown Policy'}
                        </div>
                        <div className="text-white">
                            <span className="font-bold">Amount:</span> ₹{claim.amount_claimed?.toLocaleString()}
                        </div>
                        <div className="text-white flex items-center gap-2">
                            <span className="font-bold">Status:</span>
                            <span className={`${getStatusColor(claim.status)} font-semibold capitalize`}>
                                {claim.status}
                            </span>
                        </div>
                        <div className="text-white">
                            <span className="font-bold">Filed On:</span> {new Date(claim.created_at).toLocaleDateString()}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-2">Reason</h3>
                        <p className="text-white/80 leading-relaxed">
                            {claim.description || "No description provided."}
                        </p>
                        {claim.status === 'pending' || claim.status === 'submitted' || claim.status === 'draft' ? (
                            <p className="text-white/60 text-sm mt-2">Documents are under verification.</p>
                        ) : null}
                    </div>

                    <div>
                        <h3 className="font-bold text-white mb-3">Documents</h3>
                        {claim.documents && claim.documents.length > 0 ? (
                            <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 flex items-start gap-3">
                                <FileText className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-white font-medium">
                                        {claim.documents.length} document{claim.documents.length > 1 ? 's' : ''} submitted
                                    </p>
                                    <p className="text-white/60 text-sm mt-1">
                                        Your documents are securely stored and are currently under review by our admin team. You will be notified once a decision is made.
                                    </p>
                                    <ul className="mt-2 space-y-1">
                                        {claim.documents.map((doc, index) => (
                                            <li key={doc.id || index} className="flex items-center gap-2 text-white/50 text-sm">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400/60"></div>
                                                <span>{doc.doc_type || `Document ${index + 1}`}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/60 italic">No documents uploaded.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetails;
