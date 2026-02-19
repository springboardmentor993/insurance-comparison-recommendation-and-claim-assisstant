import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { FileUpload } from '../../components/claims/FileUpload';
import claimService from '../../services/claimService';

export const FileClaim = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [claimNumber, setClaimNumber] = useState('');

    const [userPolicies, setUserPolicies] = useState([]);
    const [formData, setFormData] = useState({
        policy_id: '',
        claim_type: 'health',
        incident_date: '',
        amount_claimed: '',
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        fetchUserPolicies();
    }, []);

    const fetchUserPolicies = async () => {
        setLoading(true);
        try {
            const data = await claimService.getUserPolicies();
            setUserPolicies(data);
        } catch (err) {
            toast.error('Failed to load your policies');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.policy_id) {
                toast.error('Please select a policy');
                return false;
            }
        } else if (step === 2) {
            if (!formData.claim_type || !formData.incident_date || !formData.amount_claimed) {
                toast.error('Please fill in all claim details');
                return false;
            }
            if (parseFloat(formData.amount_claimed) <= 0) {
                toast.error('Claim amount must be greater than 0');
                return false;
            }
        } else if (step === 3) {
            if (files.length === 0) {
                toast.error('Please upload at least one document');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setSubmitting(true);

        try {
            // First, create the claim
            const claimData = {
                policy_id: parseInt(formData.policy_id),
                claim_type: formData.claim_type,
                incident_date: new Date(formData.incident_date).toISOString(),
                amount_claimed: parseFloat(formData.amount_claimed),
            };

            const claim = await claimService.fileClaim(claimData);
            setClaimNumber(claim.claim_number);

            // Then upload documents
            for (const { file, docType } of files) {
                await claimService.uploadDocument(claim.id, file, docType);
            }

            setSuccess(true);

            setTimeout(() => {
                navigate(`/claims/${claim.id}`);
            }, 3000);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to file claim');
            setSubmitting(false);
        }
    };

    const steps = [
        { number: 1, title: 'Select Policy' },
        { number: 2, title: 'Claim Details' },
        { number: 3, title: 'Upload Documents' },
        { number: 4, title: 'Review & Submit' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto animate-scale-up">
                <Card glass hover={false}>
                    <div className="text-center py-12">
                        <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
                            <CheckCircle className="h-16 w-16 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Claim Filed Successfully!</h2>
                        <p className="text-slate-300 mb-4">Your claim has been submitted and is under review.</p>
                        <div className="glass rounded-lg p-6 max-w-md mx-auto mb-6">
                            <p className="text-sm text-slate-400 mb-2">Your Claim Number</p>
                            <p className="text-2xl font-bold gradient-text">{claimNumber}</p>
                        </div>
                        <p className="text-sm text-slate-400">Redirecting to claim details...</p>
                    </div>
                </Card>
            </div>
        );
    }

    if (userPolicies.length === 0) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card glass hover={false}>
                    <div className="text-center py-12">
                        <h3 className="text-xl font-bold text-white mb-2">No Active Policies</h3>
                        <p className="text-slate-400 mb-6">
                            You need to purchase a policy before filing a claim
                        </p>
                        <Button variant="primary" onClick={() => navigate('/policies')}>
                            Browse Policies
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const selectedPolicy = userPolicies.find(p => p.policy_id === parseInt(formData.policy_id));

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold gradient-text">File a New Claim</h1>

            {/* Progress Indicator */}
            <Card glass hover={false}>
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.number} className="flex items-center flex-1">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep > step.number
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                        }`}
                                >
                                    {currentStep > step.number ? <Check size={20} /> : step.number}
                                </div>
                                <p
                                    className={`text-sm mt-2 hidden sm:block ${currentStep === step.number ? 'text-white font-medium' : 'text-slate-400'
                                        }`}
                                >
                                    {step.title}
                                </p>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-1 mx-2 rounded transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-slate-700'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </Card>

            {/* Step Content */}
            <Card glass hover={false}>
                <div className="min-h-[400px]">
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4">Select Your Policy</h2>
                            <div className="space-y-3">
                                {userPolicies.map(policy => (
                                    <label
                                        key={policy.id}
                                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.policy_id === policy.id.toString()
                                            ? 'border-blue-500 bg-blue-500/10'
                                            : 'border-slate-700 hover:border-slate-600'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="policy_id"
                                            value={policy.policy_id}
                                            checked={formData.policy_id === policy.policy_id.toString()}
                                            onChange={handleChange}
                                            className="w-5 h-5"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-white">{policy.title}</p>
                                            <p className="text-sm text-slate-400">{policy.policy_type} - {policy.provider_name}</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Premium: ₹{policy.premium.toLocaleString()}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-4">Enter Claim Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Claim Type</label>
                                <select
                                    name="claim_type"
                                    value={formData.claim_type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50"
                                >
                                    <option value="health">Health</option>
                                    <option value="life">Life</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>

                            <Input
                                label="Incident Date"
                                type="date"
                                name="incident_date"
                                value={formData.incident_date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />

                            <Input
                                label="Claim Amount (₹)"
                                type="number"
                                name="amount_claimed"
                                placeholder="Enter the amount you're claiming"
                                value={formData.amount_claimed}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4">Upload Supporting Documents</h2>
                            <p className="text-slate-400 mb-6">
                                Upload relevant documents such as medical reports, invoices, photos, etc.
                            </p>
                            <FileUpload files={files} onFilesChange={setFiles} />
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white mb-4">Review Your Claim</h2>

                            <div className="space-y-4">
                                <div className="glass-dark rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400">Policy:</span>
                                        <span className="text-white font-medium">{selectedPolicy?.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Provider:</span>
                                        <span className="text-white">{selectedPolicy?.provider_name}</span>
                                    </div>
                                </div>

                                <div className="glass-dark rounded-lg p-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400">Claim Type:</span>
                                        <span className="text-white font-medium capitalize">{formData.claim_type}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-slate-400">Incident Date:</span>
                                        <span className="text-white">{new Date(formData.incident_date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Amount Claimed:</span>
                                        <span className="text-white font-bold">₹{parseFloat(formData.amount_claimed).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="glass-dark rounded-lg p-4">
                                    <p className="text-slate-400 mb-2">Documents: {files.length} file(s)</p>
                                    <div className="space-y-1">
                                        {files.map(({ file, docType }, index) => (
                                            <div key={index} className="text-sm text-white">
                                                • {file.name} ({docType.replace('_', ' ')})
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1}
                    >
                        <ChevronLeft size={20} />
                        Back
                    </Button>

                    {currentStep < 4 ? (
                        <Button variant="primary" onClick={handleNext}>
                            Next
                            <ChevronRight size={20} />
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            loading={submitting}
                        >
                            Submit Claim
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default FileClaim;
