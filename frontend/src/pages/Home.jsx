import { Link } from 'react-router-dom';
import { FileText, TrendingUp, FolderOpen, ArrowRight, Shield, CheckCircle, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const Home = () => {
    const { user } = useAuth();

    const stats = [
        { label: 'Policies Available', value: '500+', icon: FileText, color: 'from-blue-600 to-blue-700' },
        { label: 'Happy Customers', value: '10K+', icon: Users, color: 'from-purple-600 to-purple-700' },
        { label: 'Claims Processed', value: '5K+', icon: FolderOpen, color: 'from-green-600 to-green-700' },
    ];

    const quickActions = [
        {
            title: 'Browse Policies',
            description: 'Explore our comprehensive policy catalog',
            icon: FileText,
            link: '/policies',
            color: 'blue'
        },
        {
            title: 'Get Recommendations',
            description: 'Find personalized policy recommendations',
            icon: TrendingUp,
            link: '/recommendations',
            color: 'purple'
        },
        {
            title: 'File a Claim',
            description: 'Submit and track your insurance claims',
            icon: FolderOpen,
            link: '/claims/file',
            color: 'green'
        },
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-gradient" />
                <Card className="relative border-2 border-blue-500/30" glass hover={false}>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
                            <Shield className="h-16 w-16 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold gradient-text mb-2">
                                Welcome back, {user?.name || 'User'}!
                            </h1>
                            <p className="text-slate-300 text-lg">
                                Your trusted insurance management platform
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="text-center" glass>
                            <div className={`inline-flex p-4 bg-gradient-to-br ${stat.color} rounded-2xl mb-4`}>
                                <Icon className="h-8 w-8 text-white" />
                            </div>
                            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-slate-400">{stat.label}</p>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        const colors = {
                            blue: 'from-blue-600 to-blue-700',
                            purple: 'from-purple-600 to-purple-700',
                            green: 'from-green-600 to-green-700',
                        };

                        return (
                            <Link key={index} to={action.link}>
                                <Card className="h-full group cursor-pointer" glass>
                                    <div className={`inline-flex p-3 bg-gradient-to-br ${colors[action.color]} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                                    <p className="text-slate-400 mb-4">{action.description}</p>
                                    <div className="flex items-center text-blue-400 group-hover:text-blue-300">
                                        <span className="mr-2">Get started</span>
                                        <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Features */}
            <Card glass hover={false}>
                <h2 className="text-2xl font-bold text-white mb-6">Why Choose InsureMe?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        'Compare policies from top providers',
                        'Personalized recommendations based on your needs',
                        'Easy claim filing with document upload',
                        'Real-time claim status tracking',
                        'Fraud detection for your safety',
                        'Expert support whenever you need',
                    ].map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
                            <p className="text-slate-300">{feature}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Home;
