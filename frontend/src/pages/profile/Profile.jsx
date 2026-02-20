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
        budget_min: '',
        budget_max: '',
        preferred_policy_types: [],
    });

    // Grouped by insurance type to match backend schema
    const [riskFactors, setRiskFactors] = useState({
        health: {
            medical_history: '',
            smoking_status: 'non_smoker',
        },
        life: {
            occupation_risk: 'medium',
        },
        auto: {
            vehicle_age: '',
        }
    });

    const [policies, setPolicies] = useState([]);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // Fetch both basic info and extended profile data in parallel
            const [basicInfo, profileData] = await Promise.all([
                profileService.getMe(),
                profileService.getProfile()
            ]);

            setFormData({
                name: basicInfo.name || '',
                email: basicInfo.email || '',
                dob: basicInfo.dob ? basicInfo.dob.split('T')[0] : '',
            });

            // Map backend preferences to state
            const prefs = profileData.preferences || {};
            setPreferences({
                budget_min: prefs.budget_min || '',
                budget_max: prefs.budget_max || '',
                preferred_policy_types: prefs.preferred_policy_types || [],
            });

            // Map backend risk factors to state
            const risks = data.risk_factors || {};

            // Handle potentially flat or missing data structure gracefully
            setRiskFactors({
                health: {
                    medical_history: Array.isArray(risks.health?.medical_history)
                        ? risks.health.medical_history.join(', ')
                        : (risks.health?.medical_history || ''),
                    smoking_status: risks.health?.smoking_status || 'non_smoker',
                },
                life: {
                    occupation_risk: risks.life?.occupation_risk || 'medium',
                },
                auto: {
                    vehicle_age: risks.auto?.car_age_years || '',
                }
            });

            setPolicies(data.policies || []);
        } catch (err) {
            console.error("Error loading profile:", err);
            // Don't show error on 404 (user might just not have a profile yet)
            if (err.response && err.response.status !== 404) {
                toast.error('Failed to load profile data');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePrefInputChange = (e) => {
        const { name, value } = e.target;
        setPreferences({
            ...preferences,
            [name]: value,
        });
    };

    const handleHealthChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRiskFactors(prev => ({
            ...prev,
            health: {
                ...prev.health,
                [name]: type === 'checkbox'
                    ? (checked ? 'regular' : 'non_smoker') // simple bool to enum mapping for now
                    : value
            }
        }));
    };

    const handleLifeChange = (e) => {
        const { name, value } = e.target;
        setRiskFactors(prev => ({
            ...prev,
            life: {
                ...prev.life,
                [name]: value
            }
        }));
    };

    const handleAutoChange = (e) => {
        const { name, value } = e.target;
        setRiskFactors(prev => ({
            ...prev,
            auto: {
                ...prev.auto,
                [name]: value
            }
        }));
    };

    // Checkbox handler for smoker specific logic
    const handleSmokerChange = (e) => {
        const isSmoker = e.target.checked;
        setRiskFactors(prev => ({
            ...prev,
            health: {
                ...prev.health,
                smoking_status: isSmoker ? 'regular' : 'non_smoker'
            }
        }));
    };

    const handlePrefTypeToggle = (type) => {
        if (preferences.preferred_policy_types.includes(type)) {
            setPreferences({
                ...preferences,
                preferred_policy_types: preferences.preferred_policy_types.filter(t => t !== type),
            });
        } else {
            setPreferences({
                ...preferences,
                preferred_policy_types: [...preferences.preferred_policy_types, type],
            });
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            // Construct payload matching backend UserProfileUpdate schema
            const payload = {
                preferences: {
                    budget_min: parseFloat(preferences.budget_min) || null,
                    budget_max: parseFloat(preferences.budget_max) || null,
                    preferred_policy_types: preferences.preferred_policy_types.length > 0
                        ? preferences.preferred_policy_types
                        : null,
                },
                risk_factors: {
                    health: {
                        medical_history: riskFactors.health.medical_history
                            ? riskFactors.health.medical_history.split(',').map(s => s.trim()).filter(Boolean)
                            : [],
                        smoking_status: riskFactors.health.smoking_status,
                    },
                    life: {
                        occupation_risk: riskFactors.life.occupation_risk,
                    },
                    auto: {
                        car_age_years: riskFactors.auto.vehicle_age
                            ? parseInt(riskFactors.auto.vehicle_age)
                            : null,
                    }
                },
            };

            await profileService.updateProfile(payload);
            toast.success('Preferences updated successfully!');
            // Reload to ensure state is in sync
            fetchProfileData();
        } catch (err) {
            console.error("Save error:", err);
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
                                name="budget_min"
                                placeholder="e.g., 5000"
                                value={preferences.budget_min}
                                onChange={handlePrefInputChange}
                            />
                            <Input
                                label="Maximum Budget (₹)"
                                type="number"
                                name="budget_max"
                                placeholder="e.g., 20000"
                                value={preferences.budget_max}
                                onChange={handlePrefInputChange}
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
                                        className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${preferences.preferred_policy_types.includes(type)
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
                        {/* Health Section */}
                        <div className="border-b border-slate-700 pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Health</h3>
                            <Input
                                label="Medical History (comma separated)"
                                name="medical_history"
                                placeholder="e.g., Diabetes, Hypertension"
                                value={riskFactors.health.medical_history}
                                onChange={handleHealthChange}
                                className="mb-4"
                            />
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="smoking_status"
                                    id="smoker"
                                    checked={riskFactors.health.smoking_status === 'regular'}
                                    onChange={handleSmokerChange}
                                    className="w-5 h-5 rounded border-2 border-blue-500 checked:bg-blue-600 cursor-pointer"
                                />
                                <label htmlFor="smoker" className="text-slate-300">
                                    I am a regular smoker
                                </label>
                            </div>
                        </div>

                        {/* Life Section */}
                        <div className="border-b border-slate-700 pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Life & Occupation</h3>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Occupation Risk Level
                            </label>
                            <select
                                name="occupation_risk"
                                value={riskFactors.life.occupation_risk}
                                onChange={handleLifeChange}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="low">Low (Office/Desk Job)</option>
                                <option value="medium">Medium (Field work, Sales)</option>
                                <option value="high">High (Manual labor, Hazardous)</option>
                            </select>
                        </div>

                        {/* Auto Section */}
                        <div className="pb-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Auto</h3>
                            <Input
                                label="Vehicle Age (years)"
                                type="number"
                                name="vehicle_age"
                                placeholder="e.g., 3"
                                value={riskFactors.auto.vehicle_age}
                                onChange={handleAutoChange}
                            />
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
