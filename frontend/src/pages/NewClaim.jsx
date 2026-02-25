import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimAPI, policyAPI } from '../api';
import {
    Upload, FileText, Calendar, IndianRupee,
    AlertCircle, CheckCircle, Loader, ChevronRight,
    Shield, ArrowLeft, CloudUpload
} from 'lucide-react';

const CLAIM_TYPES = ['Accident', 'Medical', 'Theft', 'Natural Disaster', 'Fire', 'Flood', 'Other'];

const DOC_SLOTS = ['Accident Report', 'Police Report', 'Photographs', 'Repair Estimate'];

const NewClaim = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [policiesLoading, setPoliciesLoading] = useState(true);
    const [claimData, setClaimData] = useState({
        user_policy_id: '',
        claim_type: 'Accident',
        incident_date: '',
        amount_claimed: '',
        description: ''
    });
    const [claimId, setClaimId] = useState(null);
    const [error, setError] = useState('');
    const [docSlots, setDocSlots] = useState({});
    const [uploadStatus, setUploadStatus] = useState({});

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const response = await policyAPI.getMyPolicies();
            if (response.data && response.data.length > 0) {
                setPolicies(response.data);
            } else {
                // Fall back to all available policies
                const allResponse = await policyAPI.getAll({});
                // Wrap them in a user-policy-like shape so the form works
                const wrapped = allResponse.data.map(p => ({
                    id: p.id,
                    policy_number: `POL-${p.id}`,
                    premium: p.premium,
                    policy: p,
                    _isCatalog: true
                }));
                setPolicies(wrapped);
            }
        } catch (err) {
            setError('Failed to load policies. Please refresh.');
        } finally {
            setPoliciesLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setClaimData({ ...claimData, [e.target.name]: e.target.value });
    };

    const handleCreateClaim = async (e) => {
        e.preventDefault();
        setError('');
        if (!claimData.user_policy_id) { setError('Please select a policy.'); return; }
        if (!claimData.incident_date) { setError('Please enter the incident date.'); return; }
        if (!claimData.amount_claimed || parseFloat(claimData.amount_claimed) <= 0) {
            setError('Please enter a valid claim amount.'); return;
        }
        setLoading(true);
        try {
            // If it's a catalog policy (not a user-owned policy), enroll first
            const selectedPol = policies.find(p => String(p.id) === String(claimData.user_policy_id));
            let userPolicyId = parseInt(claimData.user_policy_id);

            if (selectedPol?._isCatalog) {
                const enrollRes = await policyAPI.enrollInPolicy(selectedPol.policy.id);
                userPolicyId = enrollRes.data.id;
            }

            const response = await claimAPI.create({
                user_policy_id: userPolicyId,
                claim_type: claimData.claim_type,
                incident_date: claimData.incident_date,
                amount_claimed: parseFloat(claimData.amount_claimed),
                description: claimData.description
            });
            setClaimId(response.data.id);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to create claim. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (slotName, e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDocSlots(prev => ({ ...prev, [slotName]: file }));
        uploadDocument(file, slotName);
    };

    const uploadDocument = async (file, slotName) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('doc_type', slotName);
        setUploadStatus(prev => ({ ...prev, [slotName]: 'uploading' }));
        try {
            await claimAPI.uploadDocument(claimId, formData);
            setUploadStatus(prev => ({ ...prev, [slotName]: 'success' }));
        } catch (err) {
            setUploadStatus(prev => ({ ...prev, [slotName]: 'error' }));
        }
    };

    const handleSubmitClaim = async () => {
        const uploaded = Object.values(uploadStatus).filter(s => s === 'success').length;
        if (uploaded === 0) {
            setError('Please upload at least one document before submitting.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await claimAPI.submit(claimId);
            navigate('/claims');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to submit claim.');
        } finally {
            setLoading(false);
        }
    };

    const selectedPolicy = policies.find(p => String(p.id) === String(claimData.user_policy_id));

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 animated-bg-pattern">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="mb-8 animate-slide-up">
                    <button
                        onClick={() => navigate('/claims')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Claims
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">File Insurance Claim</h1>
                            <p className="text-gray-500 text-sm">Complete all steps to submit your claim</p>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-8">
                    {[1, 2].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${step === s
                                ? 'bg-primary-600 text-white shadow-lg'
                                : step > s
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                {step > s ? <CheckCircle className="h-4 w-4" /> : <span>{s}</span>}
                                {s === 1 ? 'Claim Details' : 'Upload Documents'}
                            </div>
                            {s < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-scale-in">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* ── STEP 1: Claim Details ── */}
                {step === 1 && (
                    <div className="glass-effect rounded-3xl p-8 animate-slide-up bg-white/80">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Step 1: Claim Details</h2>

                        <form onSubmit={handleCreateClaim} className="space-y-5">

                            {/* Select Policy */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Policy <span className="text-red-500">*</span>
                                </label>
                                {policiesLoading ? (
                                    <div className="flex items-center gap-2 text-gray-400 text-sm p-3">
                                        <Loader className="h-4 w-4 animate-spin" /> Loading policies...
                                    </div>
                                ) : policies.length === 0 ? (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
                                        No active policies found. Please purchase a policy first.
                                    </div>
                                ) : (
                                    <select
                                        name="user_policy_id"
                                        required
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                        value={claimData.user_policy_id}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">— Choose a policy —</option>
                                        {policies.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.policy?.title || 'Unknown Policy'} · {p.policy_number}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {/* Selected policy preview */}
                                {selectedPolicy && (
                                    <div className="mt-2 bg-primary-50 border border-primary-100 rounded-xl p-3 flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-primary-600 shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-primary-800">{selectedPolicy.policy?.title}</p>
                                            <p className="text-primary-600">Policy No: {selectedPolicy.policy_number} · ₹{selectedPolicy.premium?.toLocaleString()}/mo</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Claim Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Claim Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="claim_type"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                    value={claimData.claim_type}
                                    onChange={handleInputChange}
                                >
                                    {CLAIM_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Incident Date + Amount — 2 columns */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Incident Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            name="incident_date"
                                            required
                                            max={new Date().toISOString().split('T')[0]}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                            value={claimData.incident_date}
                                            onChange={handleInputChange}
                                        />
                                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Amount Claimed (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            name="amount_claimed"
                                            required
                                            min="1"
                                            placeholder="0.00"
                                            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                                            value={claimData.amount_claimed}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Incident Description <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Describe what happened in detail..."
                                    rows={4}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all resize-none"
                                    value={claimData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || policies.length === 0}
                                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <><Loader className="h-4 w-4 animate-spin" /> Creating claim...</>
                                ) : (
                                    <>Continue to Documents <ChevronRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* ── STEP 2: Upload Documents ── */}
                {step === 2 && (
                    <div className="glass-effect rounded-3xl p-8 animate-slide-up bg-white/80">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Step 2: Upload Documents</h2>
                        <p className="text-gray-500 text-sm mb-6">Upload supporting documents for your claim. At least one document is required.</p>

                        <div className="space-y-3 mb-6">
                            {DOC_SLOTS.map((slotName) => {
                                const status = uploadStatus[slotName];
                                const file = docSlots[slotName];
                                return (
                                    <div key={slotName} className={`border-2 rounded-xl p-4 transition-all ${status === 'success' ? 'border-green-300 bg-green-50' :
                                        status === 'error' ? 'border-red-300 bg-red-50' :
                                            status === 'uploading' ? 'border-blue-300 bg-blue-50' :
                                                'border-dashed border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {status === 'success' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                ) : status === 'uploading' ? (
                                                    <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                                                ) : (
                                                    <CloudUpload className="h-5 w-5 text-gray-400" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">{slotName}</p>
                                                    {file && status === 'success' && (
                                                        <p className="text-xs text-green-600 mt-0.5">{file.name}</p>
                                                    )}
                                                    {status === 'error' && (
                                                        <p className="text-xs text-red-600 mt-0.5">Upload failed — try again</p>
                                                    )}
                                                </div>
                                            </div>

                                            <label className={`cursor-pointer text-sm font-semibold px-4 py-2 rounded-lg transition-all ${status === 'success'
                                                ? 'text-green-700 bg-green-100 hover:bg-green-200'
                                                : 'text-primary-600 bg-primary-50 hover:bg-primary-100'
                                                }`}>
                                                {status === 'success' ? 'Replace' : 'Upload'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={(e) => handleFileSelect(slotName, e)}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Upload summary */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                            <p className="text-blue-700 text-sm">
                                <span className="font-semibold">
                                    {Object.values(uploadStatus).filter(s => s === 'success').length} of {DOC_SLOTS.length}
                                </span> documents uploaded. At least 1 required to submit.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStep(1); setError(''); }}
                                className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleSubmitClaim}
                                disabled={loading || Object.values(uploadStatus).filter(s => s === 'success').length === 0}
                                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <><Loader className="h-4 w-4 animate-spin" /> Submitting...</>
                                ) : (
                                    <>Submit Claim <CheckCircle className="h-4 w-4" /></>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewClaim;
