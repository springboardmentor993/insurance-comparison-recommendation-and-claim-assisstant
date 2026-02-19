import { useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { CheckCircle } from 'lucide-react';
import policyService from '../../services/policyService';

export const PurchaseModal = ({ isOpen, onClose, policy, onSuccess }) => {
    const [formData, setFormData] = useState({
        term_months: 12,
        auto_renew: false,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [purchaseData, setPurchaseData] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handlePurchase = async () => {
        setLoading(true);

        try {
            const data = await policyService.purchasePolicy({
                policy_id: policy.id,
                term_months: parseInt(formData.term_months),
                auto_renew: formData.auto_renew,
            });

            setPurchaseData(data);
            setSuccess(true);

            setTimeout(() => {
                onSuccess?.();
                handleClose();
            }, 3000);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Purchase failed');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ term_months: 12, auto_renew: false });
        setSuccess(false);
        setPurchaseData(null);
        onClose();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!policy) return null;

    if (success && purchaseData) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Successful!" size="md">
                <div className="text-center py-8 space-y-4 animate-scale-up">
                    <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
                        <CheckCircle className="h-16 w-16 text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Congratulations!</h3>
                    <p className="text-slate-300">Your policy has been purchased successfully.</p>

                    <div className="glass rounded-lg p-6 text-left space-y-3 mt-6">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Policy Number:</span>
                            <span className="text-white font-bold">{purchaseData.policy_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Start Date:</span>
                            <span className="text-white">{new Date(purchaseData.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">End Date:</span>
                            <span className="text-white">{new Date(purchaseData.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Premium:</span>
                            <span className="text-white font-bold">{formatCurrency(purchaseData.premium)}</span>
                        </div>
                    </div>

                    <p className="text-sm text-slate-400 mt-4">Redirecting...</p>
                </div>
            </Modal>
        );
    }

    const totalCost = policy.premium * (formData.term_months / 12);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Policy" size="md">
            <div className="space-y-6">
                <div className="glass-dark rounded-lg p-4">
                    <h3 className="font-bold text-white mb-1">{policy.title}</h3>
                    <p className="text-slate-400 text-sm">{policy.provider.name}</p>
                    <p className="text-2xl font-bold gradient-text mt-2">{formatCurrency(policy.premium)}/year</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select Term (Months)
                        </label>
                        <select
                            name="term_months"
                            value={formData.term_months}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50"
                        >
                            <option value="12">12 months (1 year)</option>
                            <option value="24">24 months (2 years)</option>
                            <option value="36">36 months (3 years)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="auto_renew"
                            id="auto_renew"
                            checked={formData.auto_renew}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-2 border-blue-500 checked:bg-blue-600 cursor-pointer"
                        />
                        <label htmlFor="auto_renew" className="text-slate-300">
                            Enable Auto-Renewal
                        </label>
                    </div>
                </div>

                <div className="glass rounded-lg p-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Term:</span>
                        <span className="text-white">{formData.term_months} months</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400">Annual Premium:</span>
                        <span className="text-white">{formatCurrency(policy.premium)}</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Total Cost:</span>
                            <span className="text-2xl font-bold gradient-text">{formatCurrency(totalCost)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handlePurchase}
                        loading={loading}
                        className="flex-1"
                    >
                        Confirm Purchase
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PurchaseModal;
