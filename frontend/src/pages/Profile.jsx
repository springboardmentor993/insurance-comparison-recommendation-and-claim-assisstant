import React from 'react';
import { useAuth } from '../AuthContext';
import {
    User, Mail, Calendar, Shield, Star,
    CheckCircle, Clock, CreditCard
} from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    const memberSince = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const dob = user.dob
        ? new Date(user.dob).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Not provided';

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const InfoRow = ({ icon: Icon, label, value }) => (
        <div className="flex items-start gap-4 p-4 bg-white/60 rounded-xl border border-white/40 hover:bg-white/80 transition-colors">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-100 to-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary-600" />
            </div>
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className="text-gray-800 font-medium mt-0.5">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen animated-bg-pattern py-10 px-4">
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

                {/* Profile Card */}
                <div className="glass-effect rounded-3xl p-8 text-center animate-bounce-in">
                    {/* Avatar */}
                    <div className="relative inline-block mb-4">
                        <div className="h-28 w-28 bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl mx-auto">
                            {initials}
                        </div>
                        {user.is_admin && (
                            <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                                Admin
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-gray-500 mt-1">{user.email}</p>

                    {/* Badge */}
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${user.is_admin
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-primary-100 text-primary-700'
                            }`}>
                            {user.is_admin ? <Star className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                            {user.is_admin ? 'Administrator' : 'Member'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Active
                        </span>
                    </div>
                </div>

                {/* Info Section */}
                <div className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary-600" />
                        Account Information
                    </h2>
                    <div className="space-y-3">
                        <InfoRow icon={User} label="Full Name" value={user.name} />
                        <InfoRow icon={Mail} label="Email Address" value={user.email} />
                        <InfoRow icon={Calendar} label="Date of Birth" value={dob} />
                        <InfoRow icon={Clock} label="Member Since" value={memberSince} />
                        <InfoRow icon={Shield} label="Account Type" value={user.is_admin ? 'Administrator' : 'Standard Member'} />
                    </div>
                </div>

                {/* Risk Profile */}
                {user.risk_profile && Object.keys(user.risk_profile).length > 0 && (
                    <div className="glass-effect rounded-3xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary-600" />
                            Insurance Preferences
                        </h2>
                        <div className="space-y-3">
                            {user.risk_profile.preferred_types && (
                                <div className="p-4 bg-white/60 rounded-xl border border-white/40">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Preferred Policy Types</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.risk_profile.preferred_types.map(type => (
                                            <span key={type} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium capitalize">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {user.risk_profile.max_budget && (
                                <div className="p-4 bg-white/60 rounded-xl border border-white/40">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Monthly Budget</p>
                                    <p className="text-gray-800 font-semibold text-lg">₹{user.risk_profile.max_budget.toLocaleString()}</p>
                                </div>
                            )}
                            {user.risk_profile.coverage_needs && (
                                <div className="p-4 bg-white/60 rounded-xl border border-white/40">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Coverage Needs</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.risk_profile.coverage_needs.map(need => (
                                            <span key={need} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                                                {need}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
