import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
    FileText,
    TrendingUp,
    Shield,
    BarChart3,
    Sparkles,
    ArrowRight,
    Activity,
    Settings
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState([
        { id: 1, label: 'Active Policies', value: '3', icon: Shield, color: 'from-blue-500 to-cyan-500', delay: '0s' },
        { id: 2, label: 'Total Claims', value: '12', icon: FileText, color: 'from-purple-500 to-pink-500', delay: '0.1s' },
        { id: 3, label: 'Recommendations', value: '5', icon: TrendingUp, color: 'from-green-500 to-emerald-500', delay: '0.2s' },
        { id: 4, label: 'Savings', value: '₹2.4k', icon: Activity, color: 'from-orange-500 to-red-500', delay: '0.3s' },
    ]);

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 animated-bg-pattern relative overflow-hidden">
            {/* Floating background elements */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Welcome Header */}
                <div className="mb-10 animate-slide-up">
                    <h1 className="text-5xl font-bold gradient-text flex items-center gap-3 mb-2">
                        Welcome back, {user?.name}!
                        <Sparkles className="h-10 w-10 text-yellow-500 animate-pulse" />
                    </h1>
                    <p className="text-gray-600 text-lg">Here's what's happening with your insurance today</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat) => (
                        <div
                            key={stat.id}
                            className="card-hover animate-scale-in"
                            style={{ animationDelay: stat.delay }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`h-16 w-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 hover:rotate-6 transition-all duration-300`}>
                                    <stat.icon className="h-8 w-8 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm text-green-600 font-semibold">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                +12% from last month
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    <QuickActionCard
                        to="/preferences"
                        title="Set Preferences"
                        description="Customize your insurance recommendations"
                        icon={Settings}
                        gradient="from-purple-500 to-pink-500"
                        delay="0s"
                    />
                    <QuickActionCard
                        to="/policies"
                        title="Browse Policies"
                        description="Explore and compare insurance policies"
                        icon={Shield}
                        gradient="from-blue-500 to-cyan-500"
                        delay="0.1s"
                    />
                    <QuickActionCard
                        to="/recommendations"
                        title="Get Recommendations"
                        description="Personalized policy suggestions for you"
                        icon={TrendingUp}
                        gradient="from-green-500 to-emerald-500"
                        delay="0.2s"
                    />
                </div>

                {/* Admin Panel Link */}
                {user?.is_admin && (
                    <div className="glass-effect p-8 rounded-3xl animate-bounce-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <BarChart3 className="h-8 w-8 text-primary-600" />
                                    <h2 className="text-3xl font-bold gradient-text">Admin Dashboard</h2>
                                </div>
                                <p className="text-gray-600 text-lg">Monitor platform activity, manage claims, and view analytics</p>
                            </div>
                            <Link
                                to="/admin"
                                className="btn-primary flex items-center gap-2 shimmer-effect"
                            >
                                Open Admin Panel
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const QuickActionCard = ({ to, title, description, icon: Icon, gradient, delay }) => (
    <Link
        to={to}
        className="card-hover group animate-scale-in"
        style={{ animationDelay: delay }}
    >
        <div className="flex items-start space-x-4">
            <div className={`h-14 w-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <Icon className="h-7 w-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{title}</h3>
                <p className="text-gray-600 text-sm">{description}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </div>
    </Link>
);

export default Dashboard;
