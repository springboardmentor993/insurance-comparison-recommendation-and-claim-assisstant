import { useState, useEffect } from 'react';
import { User, Heart, DollarSign, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import profileService from '../../services/profileService';

export const Profile = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
    });

    const [preferences, setPreferences] = useState({
        min_budget: '',
        max_budget: '',
        preferred_types: [],
    });

    const [riskFactors, setRiskFactors] = useState({
        health_issues: '',
        occupation: '',
        smoker: false,
        vehicle_age: '',
    });

    const [policies, setPolicies] = useState([]);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const data = await profileService.getProfile();

            setFormData({
                name: data.name || '',
                email: data.email || '',
                dob: data.dob ? data.dob.split('T')[0] : '',
            });

            setPreferences({
                min_budget: data.preferences?.min_budget || '',
                max_budget: data.preferences?.max_budget || '',
                preferred_types: data.preferences?.preferred_types || [],
            });

            setRiskFactors({
                health_issues: data.risk_factors?.health_issues || '',
                occupation: data.risk_factors?.occupation || '',
                smoker: data.risk_factors?.smoker || false,
                vehicle_age: data.risk_factors?.vehicle_age || '',
            });

            setPolicies(data.policies || []);
        } catch (err) {
            toast.error('Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, setter, data) => {
        const { name, value, type, checked } = e.target;
        setter({
            ...data,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handlePrefTypeToggle = (type) => {
        if (preferences.preferred_types.includes(type)) {
            setPreferences({
                ...preferences,
                preferred_types: preferences.preferred_types.filter(t => t !== type),
            });
        } else {
            setPreferences({
                ...preferences,
                preferred_types: [...preferences.preferred_types, type],
            });
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            await profileService.updateProfile({
                preferences: {
                    min_budget: parseFloat(preferences.min_budget) || null,
                    max_budget: parseFloat(preferences.max_budget) || null,
                    preferred_types: preferences.preferred_types.length > 0 ? preferences.preferred_types : null,
                },
                risk_factors: {
                    health_issues: riskFactors.health_issues || null,
                    occupation: riskFactors.occupation || null,
                    smoker: riskFactors.smoker,
                    vehicle_age: riskFactors.vehicle_age ? parseFloat(riskFactors.vehicle_age) : null,
                },
            });
            toast.success('Preferences updated successfully!');
        } catch (err) {
            toast.error('Failed to update preferences');
        } finally {
            setSaving(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const tabs = [
        { id: 'info', label: 'Profile Info', icon: User },
        { id: 'policies', label: 'My Policies', icon: FileText },
        { id: 'preferences', label: 'Preferences', icon: Heart },
        { id: 'risk', label: 'Risk Factors', icon: DollarSign },
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold gradient-text">My Profile</h1>

            {/* Tabs */}
            <Card glass hover={false}>
                <div className="flex flex-wrap gap-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </Card>

            {/* Tab Content */}
            {activeTab === 'info' && (
                <Card glass hover={false}>
                    <h2 className="text-xl font-bold text-white mb-6">Personal Information</h2>
                    <div className="space-y-4 max-w-md">
                        <Input
                            label="Full Name"
                            value={formData.name}
                            disabled
                            className="opacity-60"
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            disabled
                            className="opacity-60"
                        />
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={formData.dob}
                            disabled
                            className="opacity-60"
                        />
                        <p className="text-sm text-slate-400">
                            To update your personal information, please contact support.
                        </p>
                    </div>
                </Card>
            )}

            {activeTab === 'policies' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">{policies.length} Active Policies</h2>
                    </div>

                    {policies.length === 0 ? (
                        <Card glass hover={false}>
                            <div className="text-center py-12">
                                <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No Policies Yet</h3>
                                <p className="text-slate-400 mb-6">Browse our catalog to find the perfect policy for you</p>
                                <Button variant="primary" onClick={() => window.location.href = '/policies'}>
                                    Browse Policies
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        policies.map(policy => (
                            <Card key={policy.id} glass>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <p className="font-bold text-white mb-1">{policy.title}</p>
                                        <p className="text-sm text-slate-400">{policy.policy_type}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Policy Number</p>
                                        <p className="text-white font-medium">{policy.policy_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-sm">Premium</p>
                                        <p className="text-white font-bold">{formatCurrency(policy.premium)}</p>
                                    </div>
                                    <div className="flex justify-end">
                                        <Badge variant={policy.status === 'active' ? 'success' : 'warning'}>
                                            {policy.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'preferences' && (
                <Card glass hover={false}>
                    <h2 className="text-xl font-bold text-white mb-6">Policy Preferences</h2>
                    <div className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Minimum Budget (₹)"
                                type="number"
                                name="min_budget"
                                placeholder="e.g., 5000"
                                value={preferences.min_budget}
                                onChange={(e) => handleInputChange(e, setPreferences, preferences)}
                            />
                            <Input
                                label="Maximum Budget (₹)"
                                type="number"
                                name="max_budget"
                                placeholder="e.g., 20000"
                                value={preferences.max_budget}
                                onChange={(e) => handleInputChange(e, setPreferences, preferences)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-3">
                                Preferred Policy Types
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['health', 'life', 'auto', 'home'].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => handlePrefTypeToggle(type)}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${preferences.preferred_types.includes(type)
                                                ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                                                : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button variant="primary" onClick={handleSavePreferences} loading={saving}>
                            Save Preferences
                        </Button>
                    </div>
                </Card>
            )}

            {activeTab === 'risk' && (
                <Card glass hover={false}>
                    <h2 className="text-xl font-bold text-white mb-6">Risk Factors</h2>
                    <p className="text-slate-400 mb-6">
                        Help us provide better recommendations by sharing your risk factors
                    </p>
                    <div className="space-y-6 max-w-2xl">
                        <Input
                            label="Health Issues (if any)"
                            name="health_issues"
                            placeholder="e.g., Diabetes, Hypertension"
                            value={riskFactors.health_issues}
                            onChange={(e) => handleInputChange(e, setRiskFactors, riskFactors)}
                        />

                        <Input
                            label="Occupation"
                            name="occupation"
                            placeholder="e.g., Software Engineer"
                            value={riskFactors.occupation}
                            onChange={(e) => handleInputChange(e, setRiskFactors, riskFactors)}
                        />

                        <Input
                            label="Vehicle Age (years)"
                            type="number"
                            name="vehicle_age"
                            placeholder="e.g., 3"
                            value={riskFactors.vehicle_age}
                            onChange={(e) => handleInputChange(e, setRiskFactors, riskFactors)}
                        />

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="smoker"
                                id="smoker"
                                checked={riskFactors.smoker}
                                onChange={(e) => handleInputChange(e, setRiskFactors, riskFactors)}
                                className="w-5 h-5 rounded border-2 border-blue-500 checked:bg-blue-600 cursor-pointer"
                            />
                            <label htmlFor="smoker" className="text-slate-300">
                                I am a smoker
                            </label>
                        </div>

                        <Button variant="primary" onClick={handleSavePreferences} loading={saving}>
                            Save Risk Factors
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Profile;
