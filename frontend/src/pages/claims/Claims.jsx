import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Plus, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import claimService from '../../services/claimService';

export const Claims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClaims();
    }, [statusFilter]);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const data = await claimService.getClaims(statusFilter || null);
            setClaims(data);
        } catch (err) {
            console.error('Failed to load claims');
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
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredClaims = claims.filter(claim => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return claim.claim_number.toLowerCase().includes(search);
    });

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
                <h1 className="text-3xl font-bold gradient-text">My Claims</h1>
                <Link to="/claims/file">
                    <Button variant="primary">
                        <Plus size={20} />
                        File New Claim
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <Card glass hover={false}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        placeholder="Search by claim number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-500/50"
                    >
                        <option value="">All Statuses</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
            </Card>

            {filteredClaims.length === 0 ? (
                <Card glass hover={false}>
                    <div className="text-center py-12">
                        <FolderOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Claims Found</h3>
                        <p className="text-slate-400 mb-6">
                            {claims.length === 0
                                ? "You haven't filed any claims yet"
                                : 'No claims match your search or filter'}
                        </p>
                        {claims.length === 0 && (
                            <Link to="/claims/file">
                                <Button variant="primary">
                                    <Plus size={20} />
                                    File Your First Claim
                                </Button>
                            </Link>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredClaims.map(claim => (
                        <Link key={claim.id} to={`/claims/${claim.id}`}>
                            <Card glass className="cursor-pointer">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-slate-400 mb-1">Claim Number</p>
                                        <p className="font-bold text-white">{claim.claim_number}</p>
                                        <p className="text-sm text-slate-400 mt-1">{claim.policy_title}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Type</p>
                                        <Badge variant="primary" size="sm">{claim.claim_type}</Badge>
                                    </div>

                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Amount</p>
                                        <p className="font-bold text-white">{formatCurrency(claim.amount_claimed)}</p>
                                    </div>

                                    <div className="flex flex-col md:items-end gap-2">
                                        <Badge variant={getStatusVariant(claim.status)}>
                                            {claim.status.replace('_', ' ').toUpperCase()}
                                        </Badge>
                                        <p className="text-xs text-slate-400">{formatDate(claim.created_at)}</p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Claims;
