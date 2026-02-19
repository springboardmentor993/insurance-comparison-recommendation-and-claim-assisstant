import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import policyService from '../../services/policyService';

export const PremiumCalculator = ({ isOpen, onClose, policy }) => {
    const [formData, setFormData] = useState({
        age: '',
        coverage_amount: '',
        term_years: '',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCalculate = async () => {
        setError('');
        setLoading(true);

        try {
            const data = await policyService.calculatePremium({
                policy_id: policy.id,
                age: parseInt(formData.age),
                coverage_amount: parseFloat(formData.coverage_amount),
                term_years: parseInt(formData.term_years),
            });
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Calculation failed');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const handleClose = () => {
        setFormData({ age: '', coverage_amount: '', term_years: '' });
        setResult(null);
        setError('');
        onClose();
    };

    if (!policy) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Premium Calculator" size="md">
            <div className="space-y-6">
                <div className="glass-dark rounded-lg p-4">
                    <h3 className="font-bold text-white mb-1">{policy.title}</h3>
                    <p className="text-slate-400 text-sm">{policy.provider.name}</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <Input
                        label="Your Age"
                        type="number"
                        name="age"
                        placeholder="e.g., 35"
                        value={formData.age}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Coverage Amount (₹)"
                        type="number"
                        name="coverage_amount"
                        placeholder="e.g., 500000"
                        value={formData.coverage_amount}
                        onChange={handleChange}
                        required
                    />

                    <Input
                        label="Term (Years)"
                        type="number"
                        name="term_years"
                        placeholder="e.g., 10"
                        value={formData.term_years}
                        onChange={handleChange}
                        required
                    />
                </div>

                {result && (
                    <div className="glass rounded-lg p-6 space-y-3 animate-scale-up">
                        <h4 className="font-bold text-white mb-4">Calculation Result</h4>

                        <div className="flex justify-between">
                            <span className="text-slate-400">Base Premium:</span>
                            <span className="text-white font-medium">{formatCurrency(result.base_premium)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-slate-400">Loading Factor:</span>
                            <span className="text-white font-medium">{result.loading_factor.toFixed(2)}x</span>
                        </div>

                        <div className="border-t border-slate-700 pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-white">Final Premium:</span>
                                <span className="text-2xl font-bold gradient-text">
                                    {formatCurrency(result.final_premium)}
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">per year</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCalculate}
                        loading={loading}
                        disabled={!formData.age || !formData.coverage_amount || !formData.term_years}
                        className="flex-1"
                    >
                        Calculate
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PremiumCalculator;
