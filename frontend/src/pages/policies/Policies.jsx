import { useState, useEffect } from 'react';
import { Search, Filter, GitCompare } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { PolicyCard } from '../../components/policies/PolicyCard';
import { PremiumCalculator } from '../../components/policies/PremiumCalculator';
import { PurchaseModal } from '../../components/policies/PurchaseModal';
import { ComparisonView } from '../../components/policies/ComparisonView';
import policyService from '../../services/policyService';
import useDebounce from '../../hooks/useDebounce';

export const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        policy_type: '',
        min_premium: '',
        max_premium: '',
    });
    const [showComparison, setShowComparison] = useState(false);
    const [comparedPolicies, setComparedPolicies] = useState([]);
    const [calculatorOpen, setCalculatorOpen] = useState(false);
    const [selectedPolicyForCalc, setSelectedPolicyForCalc] = useState(null);
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [selectedPolicyForPurchase, setSelectedPolicyForPurchase] = useState(null);

    const debouncedSearch = useDebounce(searchTerm, 300);

    useEffect(() => {
        fetchPolicies();
    }, [filters]);

    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const data = await policyService.getPolicies(filters);
            setPolicies(data);
        } catch (err) {
            toast.error('Failed to load policies');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            policy_type: '',
            min_premium: '',
            max_premium: '',
        });
    };

    const filteredPolicies = policies.filter(policy => {
        if (!debouncedSearch) return true;
        const search = debouncedSearch.toLowerCase();
        return (
            policy.title.toLowerCase().includes(search) ||
            policy.policy_type.toLowerCase().includes(search) ||
            policy.provider.name.toLowerCase().includes(search)
        );
    });

    const handleCompareToggle = (policy) => {
        if (comparedPolicies.find(p => p.id === policy.id)) {
            setComparedPolicies(comparedPolicies.filter(p => p.id !== policy.id));
        } else {
            if (comparedPolicies.length >= 3) {
                toast.warning('You can compare up to 3 policies at a time');
                return;
            }
            setComparedPolicies([...comparedPolicies, policy]);
        }
    };

    const handleOpenCalculator = (policy) => {
        setSelectedPolicyForCalc(policy);
        setCalculatorOpen(true);
    };

    const handleOpenPurchase = (policy) => {
        setSelectedPolicyForPurchase(policy);
        setPurchaseModalOpen(true);
    };

    const handlePurchaseSuccess = () => {
        toast.success('Policy purchased successfully!');
        setPurchaseModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-32">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold gradient-text">Insurance Policies</h1>
            </div>

            {/* Filters */}
            <Card glass hover={false}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Search policies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                    />

                    <div>
                        <select
                            value={filters.policy_type}
                            onChange={(e) => handleFilterChange('policy_type', e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50"
                        >
                            <option value="">All Types</option>
                            <option value="health">Health</option>
                            <option value="life">Life</option>
                            <option value="auto">Auto</option>
                            <option value="home">Home</option>
                        </select>
                    </div>

                    <Input
                        placeholder="Min Premium"
                        type="number"
                        value={filters.min_premium}
                        onChange={(e) => handleFilterChange('min_premium', e.target.value)}
                    />

                    <Input
                        placeholder="Max Premium"
                        type="number"
                        value={filters.max_premium}
                        onChange={(e) => handleFilterChange('max_premium', e.target.value)}
                    />
                </div>

                {(filters.policy_type || filters.min_premium || filters.max_premium) && (
                    <div className="mt-4">
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </Card>

            {/* Results Count */}
            {!loading && (
                <p className="text-slate-400">
                    Showing {filteredPolicies.length} of {policies.length} policies
                    {comparedPolicies.length > 0 && (
                        <span className="ml-4 text-blue-400">
                            • {comparedPolicies.length} selected for comparison
                        </span>
                    )}
                </p>
            )}

            {/* Policies Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="xl" />
                </div>
            ) : filteredPolicies.length === 0 ? (
                <Card glass hover={false}>
                    <div className="text-center py-12">
                        <Filter className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No policies found</h3>
                        <p className="text-slate-400">Try adjusting your filters or search term</p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map(policy => (
                        <PolicyCard
                            key={policy.id}
                            policy={policy}
                            isCompared={comparedPolicies.some(p => p.id === policy.id)}
                            onCompareToggle={handleCompareToggle}
                            onOpenCalculator={handleOpenCalculator}
                            onPurchase={handleOpenPurchase}
                        />
                    ))}
                </div>
            )}

            {/* Floating Compare Button */}
            {comparedPolicies.length > 0 && (
                <div className="fixed bottom-8 right-8 z-40 animate-bounce-in">
                    <Button
                        variant="primary"
                        size="lg"
                        className="shadow-lg shadow-blue-500/20 rounded-full py-4 px-6 flex items-center gap-2"
                        onClick={() => setShowComparison(true)}
                    >
                        <GitCompare size={24} />
                        Compare ({comparedPolicies.length})
                    </Button>
                </div>
            )}

            {/* Modals */}
            <PremiumCalculator
                isOpen={calculatorOpen}
                onClose={() => setCalculatorOpen(false)}
                policy={selectedPolicyForCalc}
            />

            <PurchaseModal
                isOpen={purchaseModalOpen}
                onClose={() => setPurchaseModalOpen(false)}
                policy={selectedPolicyForPurchase}
                onSuccess={handlePurchaseSuccess}
            />

            <ComparisonView
                isOpen={showComparison}
                onClose={() => setShowComparison(false)}
                policies={comparedPolicies}
                onRemove={(policy) => setComparedPolicies(comparedPolicies.filter(p => p.id !== policy.id))}
                onPurchase={handleOpenPurchase}
            />
        </div>
    );
};

export default Policies;
