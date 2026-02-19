import { useState, useEffect } from 'react';
import { TrendingUp, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import recommendationService from '../../services/recommendationService';
import { PurchaseModal } from '../../components/policies/PurchaseModal';

export const Recommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [expandedScores, setExpandedScores] = useState({});

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const data = await recommendationService.getMyRecommendations();
            setRecommendations(data);
        } catch (err) {
            // No recommendations yet, user needs to generate
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await recommendationService.generateRecommendations();
            toast.success('Recommendations generated successfully!');
            await fetchRecommendations();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to generate recommendations. Please set your preferences first.');
        } finally {
            setGenerating(false);
        }
    };

    const toggleScoreBreakdown = (id) => {
        setExpandedScores({ ...expandedScores, [id]: !expandedScores[id] });
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-green-600 to-green-700';
        if (score >= 60) return 'from-blue-600 to-blue-700';
        if (score >= 40) return 'from-yellow-600 to-yellow-700';
        return 'from-orange-600 to-orange-700';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handlePurchase = (rec) => {
        // Convert recommendation to policy object with provider
        setSelectedPolicy({
            id: rec.policy_id,
            title: rec.title,
            premium: rec.premium,
            policy_type: rec.policy_type,
            term_months: rec.term_months,
            provider: rec.provider,
        });
        setPurchaseModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Policy Recommendations</h1>
                    <p className="text-slate-400 mt-2">Personalized policies based on your preferences</p>
                </div>
                <Button
                    variant="primary"
                    onClick={handleGenerate}
                    loading={generating}
                >
                    <Sparkles size={20} />
                    Generate New Recommendations
                </Button>
            </div>

            {recommendations.length === 0 ? (
                <Card glass hover={false}>
                    <div className="text-center py-12">
                        <div className="inline-flex p-4 bg-purple-600/20 rounded-full mb-4">
                            <TrendingUp className="h-16 w-16 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Recommendations Yet</h3>
                        <p className="text-slate-400 mb-6">
                            Set your preferences in your profile and generate personalized recommendations
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="outline" onClick={() => window.location.href = '/profile'}>
                                Set Preferences
                            </Button>
                            <Button variant="primary" onClick={handleGenerate} loading={generating}>
                                <Sparkles size={20} />
                                Generate Recommendations
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <div className="space-y-6">
                    {recommendations.map((rec, index) => (
                        <Card key={rec.id} className="relative overflow-hidden" glass>
                            {/* Rank Badge */}
                            <div className="absolute top-4 right-4">
                                <Badge variant="primary" size="lg">
                                    #{index + 1}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Policy Info */}
                                <div className="lg:col-span-2 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge variant="primary" size="sm">{rec.policy_type}</Badge>
                                            {rec.provider_rating && (
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <span className="text-sm font-medium">★ {rec.provider_rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{rec.title}</h3>
                                        <p className="text-slate-400">{rec.provider.name}</p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-slate-400 text-sm">Premium</p>
                                            <p className="text-white font-bold">{formatCurrency(rec.premium)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-sm">Term</p>
                                            <p className="text-white font-bold">{rec.term_months} months</p>
                                        </div>
                                        {rec.deductible && (
                                            <div>
                                                <p className="text-slate-400 text-sm">Deductible</p>
                                                <p className="text-white font-bold">{formatCurrency(rec.deductible)}</p>
                                            </div>
                                        )}
                                        {rec.claim_settlement_ratio && (
                                            <div>
                                                <p className="text-slate-400 text-sm">Settlement</p>
                                                <p className="text-green-400 font-bold">{rec.claim_settlement_ratio}%</p>
                                            </div>
                                        )}
                                    </div>

                                    {rec.reason && (
                                        <div className="glass-dark rounded-lg p-4">
                                            <p className="text-sm font-medium text-blue-400 mb-2">Why this policy?</p>
                                            <p className="text-slate-300 text-sm">{rec.reason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Score Section */}
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(rec.score)} flex items-center justify-center mb-4 shadow-lg`}>
                                        <div>
                                            <p className="text-4xl font-bold text-white">{Math.round(rec.score)}</p>
                                            <p className="text-sm text-white/80">Score</p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="primary"
                                        onClick={() => handlePurchase(rec)}
                                        className="w-full mb-3"
                                    >
                                        Purchase Policy
                                    </Button>

                                    <button
                                        onClick={() => toggleScoreBreakdown(rec.id)}
                                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                                    >
                                        {expandedScores[rec.id] ? (
                                            <>Hide Details <ChevronUp size={16} /></>
                                        ) : (
                                            <>Show Details <ChevronDown size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Score Breakdown - Expandable */}
                            {expandedScores[rec.id] && rec.coverage && (
                                <div className="mt-6 pt-6 border-t border-slate-700/50 animate-slide-in">
                                    <h4 className="font-bold text-white mb-4">Coverage Details</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(rec.coverage).map(([key, value]) => (
                                            <div key={key} className="glass-dark rounded-lg p-3">
                                                <p className="text-slate-400 text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                                                <p className="text-white font-medium">
                                                    {typeof value === 'number' ? formatCurrency(value) : value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <PurchaseModal
                isOpen={purchaseModalOpen}
                onClose={() => setPurchaseModalOpen(false)}
                policy={selectedPolicy}
                onSuccess={() => {
                    toast.success('Policy purchased successfully!');
                    setPurchaseModalOpen(false);
                }}
            />
        </div>
    );
};

export default Recommendations;
