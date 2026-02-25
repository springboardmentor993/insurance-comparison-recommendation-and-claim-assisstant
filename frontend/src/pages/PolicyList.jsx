import React, { useState, useEffect } from 'react';
import { policyService } from '../services/api';
import { Search, Filter, DollarSign, Calendar, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PolicyList = () => {
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

            const response = await policyService.getAll(params);
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
            health: 'bg-green-50 text-green-600 border-green-100',
            auto: 'bg-blue-50 text-blue-600 border-blue-100',
            life: 'bg-indigo-50 text-indigo-600 border-indigo-100',
            home: 'bg-slate-50 text-slate-600 border-slate-100',
            travel: 'bg-sky-50 text-sky-600 border-sky-100',
        };
        return colors[type] || 'bg-slate-50 text-slate-500 border-slate-100';
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-normal text-blue-600 mb-2">policy catalog</h1>
                        <p className="text-slate-500">Browse and compare insurance policies</p>
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
                <div className="bg-white p-6 rounded-lg border border-blue-100 shadow-sm mb-8">
                    <div className="grid md:grid-cols-4 gap-4">
                        <select
                            name="policy_type"
                            value={filters.policy_type}
                            onChange={handleFilterChange}
                            className="input-field text-sm"
                        >
                            <option value="">all types</option>
                            <option value="health">health</option>
                            <option value="auto">auto</option>
                            <option value="life">life</option>
                            <option value="home">home</option>
                            <option value="travel">travel</option>
                        </select>

                        <input
                            type="number"
                            name="min_premium"
                            placeholder="min premium"
                            value={filters.min_premium}
                            onChange={handleFilterChange}
                            className="input-field text-sm"
                        />

                        <input
                            type="number"
                            name="max_premium"
                            placeholder="max premium"
                            value={filters.max_premium}
                            onChange={handleFilterChange}
                            className="input-field text-sm"
                        />

                        <button onClick={applyFilters} className="btn-primary text-sm">
                            apply filters
                        </button>
                    </div>
                </div>

                {/* Policy Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {policies.map((policy) => (
                            <div
                                key={policy.id}
                                className={`bg-white rounded-lg border transition-all p-6 cursor-pointer ${selectedPolicies.includes(policy.id)
                                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
                                    : 'border-blue-100 shadow-sm hover:border-blue-300'
                                    }`}
                                onClick={() => togglePolicySelection(policy.id)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2 py-1 rounded text-xs border ${getTypeColor(policy.policy_type)}`}>
                                        {policy.policy_type}
                                    </span>
                                    <div className={`h-4 w-4 rounded border ${selectedPolicies.includes(policy.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                        {selectedPolicies.includes(policy.id) && (
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-normal text-slate-700 mb-2">
                                    {policy.title}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-normal text-blue-600">₹{policy.premium}</span>
                                        <span className="text-xs text-slate-400">/month</span>
                                    </div>

                                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span>{policy.term_months} months term</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-slate-400" />
                                            <span>₹{policy.deductible} deductible</span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    to={`/policies/${policy.id}`}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-auto"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    view details
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyList;
