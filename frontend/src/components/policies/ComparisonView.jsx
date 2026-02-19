import { useEffect } from 'react';
import { Button } from '../ui/Button';
import { X, TrendingUp, TrendingDown } from 'lucide-react';

export const ComparisonView = ({ policies, isOpen, onClose, onRemove, onPurchase }) => {
    if (!isOpen || !policies || policies.length === 0) {
        return null;
    }

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [isOpen]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const allCoverageKeys = [
        ...new Set(policies.flatMap(p => p.coverage ? Object.keys(p.coverage) : []))
    ];

    const getBestValue = (key, type = 'number') => {
        const values = policies.map(p => p[key]).filter(v => v != null);
        if (values.length === 0) return null;

        if (type === 'number') {
            if (key === 'premium' || key === 'deductible') {
                return Math.min(...values);
            }
            return Math.max(...values);
        }
        return null;
    };

    const isBest = (value, bestValue) => {
        return value != null && bestValue != null && value === bestValue;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden animate-fade-in"
                style={{
                    background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    boxShadow: '0 0 60px rgba(59, 130, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Policy Comparison</h2>
                        <p className="text-slate-400 text-sm mt-1">{policies.length} policies selected</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700/50 rounded-lg text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Table */}
                <div className="overflow-auto p-6" style={{ maxHeight: 'calc(85vh - 100px)' }}>
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr>
                                <th className="text-left py-3 px-4 text-slate-400 font-medium border-b border-slate-700">Feature</th>
                                {policies.map((policy) => (
                                    <th key={policy.id} className="py-3 px-4 border-b border-slate-700 min-w-[200px]">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="text-left">
                                                <p className="font-bold text-white text-sm mb-1">{policy.title}</p>
                                                <p className="text-xs text-slate-400">{policy.provider.name}</p>
                                            </div>
                                            <button
                                                onClick={() => onRemove(policy)}
                                                className="p-1 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-3 px-4 text-slate-300 font-medium border-b border-slate-700">Premium (Yearly)</td>
                                {policies.map(policy => {
                                    const value = policy.premium;
                                    const best = getBestValue('premium', 'number');
                                    return (
                                        <td key={policy.id} className="py-3 px-4 border-b border-slate-700">
                                            <div className={`flex items-center gap-2 ${isBest(value, best) ? 'text-green-400' : 'text-white'}`}>
                                                <span className="font-bold">{formatCurrency(value)}</span>
                                                {isBest(value, best) && <TrendingDown size={16} />}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>

                            <tr>
                                <td className="py-3 px-4 text-slate-300 font-medium border-b border-slate-700">Term</td>
                                {policies.map(policy => (
                                    <td key={policy.id} className="py-3 px-4 border-b border-slate-700 text-white">
                                        {policy.term_months} months
                                    </td>
                                ))}
                            </tr>

                            {policies.some(p => p.deductible) && (
                                <tr>
                                    <td className="py-3 px-4 text-slate-300 font-medium border-b border-slate-700">Deductible</td>
                                    {policies.map(policy => {
                                        const value = policy.deductible;
                                        const best = getBestValue('deductible', 'number');
                                        return (
                                            <td key={policy.id} className="py-3 px-4 border-b border-slate-700">
                                                {value ? (
                                                    <div className={`flex items-center gap-2 ${isBest(value, best) ? 'text-green-400' : 'text-white'}`}>
                                                        <span>{formatCurrency(value)}</span>
                                                        {isBest(value, best) && <TrendingDown size={16} />}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">N/A</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}

                            {policies.some(p => p.claim_settlement_ratio) && (
                                <tr>
                                    <td className="py-3 px-4 text-slate-300 font-medium border-b border-slate-700">Settlement Ratio</td>
                                    {policies.map(policy => {
                                        const value = policy.claim_settlement_ratio;
                                        const best = getBestValue('claim_settlement_ratio', 'number');
                                        return (
                                            <td key={policy.id} className="py-3 px-4 border-b border-slate-700">
                                                {value ? (
                                                    <div className={`flex items-center gap-2 ${isBest(value, best) ? 'text-green-400' : 'text-white'}`}>
                                                        <span>{value}%</span>
                                                        {isBest(value, best) && <TrendingUp size={16} />}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">N/A</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}

                            {policies.some(p => p.provider_rating) && (
                                <tr>
                                    <td className="py-3 px-4 text-slate-300 font-medium border-b border-slate-700">Provider Rating</td>
                                    {policies.map(policy => {
                                        const value = policy.provider_rating;
                                        const best = getBestValue('provider_rating', 'number');
                                        return (
                                            <td key={policy.id} className="py-3 px-4 border-b border-slate-700">
                                                {value ? (
                                                    <div className={`flex items-center gap-2 ${isBest(value, best) ? 'text-green-400' : 'text-white'}`}>
                                                        <span>★ {value}</span>
                                                        {isBest(value, best) && <TrendingUp size={16} />}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">N/A</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}

                            {allCoverageKeys.length > 0 && (
                                <>
                                    <tr>
                                        <td colSpan={policies.length + 1} className="py-3 px-4 font-bold text-blue-400 border-b border-slate-700">
                                            Coverage Details
                                        </td>
                                    </tr>
                                    {allCoverageKeys.map(key => (
                                        <tr key={key}>
                                            <td className="py-3 px-4 text-slate-300 capitalize border-b border-slate-700">
                                                {key.replace(/_/g, ' ')}
                                            </td>
                                            {policies.map(policy => (
                                                <td key={policy.id} className="py-3 px-4 border-b border-slate-700 text-white">
                                                    {policy.coverage?.[key] ? (
                                                        typeof policy.coverage[key] === 'number' ?
                                                            formatCurrency(policy.coverage[key]) :
                                                            policy.coverage[key]
                                                    ) : (
                                                        <span className="text-slate-500">Not covered</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </>
                            )}

                            <tr>
                                <td className="py-4 px-4"></td>
                                {policies.map(policy => (
                                    <td key={policy.id} className="py-4 px-4">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => onPurchase(policy)}
                                            className="w-full"
                                        >
                                            Purchase
                                        </Button>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonView;
