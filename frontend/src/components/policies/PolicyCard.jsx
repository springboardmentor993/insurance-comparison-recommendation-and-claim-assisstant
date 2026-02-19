import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const PolicyCard = ({ policy, onCompareToggle, isCompared, onOpenCalculator, onPurchase }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const coverageSummary = policy.coverage
        ? Object.entries(policy.coverage).slice(0, 3).map(([key, value]) => ({
            name: key.replace(/_/g, ' '),
            value: typeof value === 'number' ? formatCurrency(value) : value
        }))
        : [];

    return (
        <Card className="h-full flex flex-col relative group" glass>
            <div className="absolute top-4 right-4 z-10">
                <input
                    type="checkbox"
                    checked={isCompared}
                    onChange={() => onCompareToggle(policy)}
                    className="w-5 h-5 rounded border-2 border-blue-500 checked:bg-blue-600 cursor-pointer accent-blue-500"
                />
            </div>

            {/* Provider Badge */}
            <div className="flex items-center justify-between mb-4">
                <Badge variant="primary" size="sm">{policy.policy_type}</Badge>
                {policy.provider_rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                        <span className="text-sm font-medium">★ {policy.provider_rating}</span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {policy.title}
            </h3>

            {/* Provider */}
            <p className="text-slate-400 text-sm mb-4">{policy.provider.name}</p>

            {/* Premium */}
            <div className="mb-4">
                <p className="text-3xl font-bold gradient-text">{formatCurrency(policy.premium)}</p>
                <p className="text-slate-400 text-sm">per year</p>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 flex-1">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Term:</span>
                    <span className="text-white font-medium">{policy.term_months} months</span>
                </div>

                {policy.deductible && (
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Deductible:</span>
                        <span className="text-white font-medium">{formatCurrency(policy.deductible)}</span>
                    </div>
                )}

                {policy.claim_settlement_ratio && (
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Settlement Ratio:</span>
                        <span className="text-green-400 font-medium">{policy.claim_settlement_ratio}%</span>
                    </div>
                )}

                {/* Coverage Summary */}
                {coverageSummary.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-sm font-medium text-slate-300 mb-2">Coverage Highlights:</p>
                        {coverageSummary.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-slate-400 capitalize">{item.name}:</span>
                                <span className="text-white font-medium">{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenCalculator(policy)}
                    className="flex-1"
                >
                    <Calculator size={16} />
                    Calculate
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onPurchase(policy)}
                    className="flex-1"
                >
                    Purchase
                </Button>
            </div>
        </Card>
    );
};

export default PolicyCard;
