import React, { useState, useEffect } from 'react';
import { policyAPI } from '../api';
import { Search, Filter, DollarSign, Calendar, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Policies = () => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        policy_type: '',
        min_premium: '',
        max_premium: '',
    });
    const [selectedPolicies, setSelectedPolicies] = useState([]);

    useEffect(() => {
        loadPolicies();
    }, []);

    const loadPolicies = async () => {
        try {
            const params = {};
            if (filters.policy_type) params.policy_type = filters.policy_type;
            if (filters.min_premium) params.min_premium = filters.min_premium;
            if (filters.max_premium) params.max_premium = filters.max_premium;

            const response = await policyAPI.getAll(params);
            setPolicies(response.data);
        } catch (error) {
            console.error('Failed to load policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        setLoading(true);
        loadPolicies();
    };

    const togglePolicySelection = (policyId) => {
        if (selectedPolicies.includes(policyId)) {
            setSelectedPolicies(selectedPolicies.filter(id => id !== policyId));
        } else {
            setSelectedPolicies([...selectedPolicies, policyId]);
        }
    };

    const getTypeColor = (type) => {
        const colors = {
            health: 'bg-green-100 text-green-800',
            auto: 'bg-blue-100 text-blue-800',
            life: 'bg-purple-100 text-purple-800',
            home: 'bg-yellow-100 text-yellow-800',
            travel: 'bg-pink-100 text-pink-800',
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Policy Catalog</h1>
                        <p className="text-gray-600">Browse and compare insurance policies</p>
                    </div>
                    {selectedPolicies.length > 1 && (
                        <Link
                            to={`/policies/compare?ids=${selectedPolicies.join(',')}`}
                            className="btn-primary"
                        >
                            Compare Selected ({selectedPolicies.length})
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="card p-6 mb-8">
                    <div className="flex items-center mb-4">
                        <Filter className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                        <select
                            name="policy_type"
                            value={filters.policy_type}
                            onChange={handleFilterChange}
                            className="input-field"
                        >
                            <option value="">All Types</option>
                            <option value="health">Health</option>
                            <option value="auto">Auto</option>
                            <option value="life">Life</option>
                            <option value="home">Home</option>
                            <option value="travel">Travel</option>
                        </select>

                        <input
                            type="number"
                            name="min_premium"
                            placeholder="Min Premium"
                            value={filters.min_premium}
                            onChange={handleFilterChange}
                            className="input-field"
                        />

                        <input
                            type="number"
                            name="max_premium"
                            placeholder="Max Premium"
                            value={filters.max_premium}
                            onChange={handleFilterChange}
                            className="input-field"
                        />

                        <button onClick={applyFilters} className="btn-primary">
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Policy Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {policies.map((policy) => (
                            <div
                                key={policy.id}
                                className={`card cursor-pointer ${selectedPolicies.includes(policy.id) ? 'ring-4 ring-blue-500' : ''
                                    }`}
                                onClick={() => togglePolicySelection(policy.id)}
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`badge ${getTypeColor(policy.policy_type)}`}>
                                            {policy.policy_type}
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={selectedPolicies.includes(policy.id)}
                                            onChange={() => { }}
                                            className="h-5 w-5 text-blue-600 rounded"
                                        />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {policy.title}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            <span className="text-2xl font-bold text-blue-600">
                                                ₹{policy.premium}
                                            </span>
                                            <span className="text-sm ml-1">/month</span>
                                        </div>

                                        {policy.term_months && (
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                <span>{policy.term_months} months term</span>
                                            </div>
                                        )}

                                        {policy.deductible && (
                                            <div className="flex items-center text-gray-600 text-sm">
                                                <Shield className="h-4 w-4 mr-2" />
                                                <span>₹{policy.deductible} deductible</span>
                                            </div>
                                        )}
                                    </div>

                                    {policy.coverage && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Coverage:</p>
                                            <div className="space-y-1">
                                                {Object.entries(policy.coverage).slice(0, 3).map(([key, value]) => (
                                                    <div key={key} className="text-sm text-gray-600">
                                                        • {key}: {value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Link
                                        to={`/policies/${policy.id}`}
                                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        View Details
                                        <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Policies;
