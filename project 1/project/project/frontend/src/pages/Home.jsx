import { ShieldCheck, FileText, Star, Calculator, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
  const features = [
    {
      icon: FileText,
      title: 'Browse Policies',
      description: 'Explore our wide range of insurance policies tailored to your needs',
      link: '/policies',
      color: 'blue',
    },
    {
      icon: Star,
      title: 'Get Recommendations',
      description: 'Receive personalized policy recommendations based on your risk profile',
      link: '/recommendations',
      color: 'purple',
    },
    {
      icon: Calculator,
      title: 'Calculate Premium',
      description: 'Estimate your insurance premium with our advanced calculator',
      link: '/calculator',
      color: 'green',
    },
  ];

  const stats = [
    { label: 'Active Policies', value: '10,000+', icon: FileText },
    { label: 'Happy Customers', value: '5,000+', icon: ShieldCheck },
    { label: 'Success Rate', value: '98%', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">InsureMe</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted partner in finding the perfect insurance coverage. 
            Explore policies, get personalized recommendations, and secure your future today.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <Icon style={{ width: '40px', height: '40px', color: '#2563eb', margin: '0 auto 12px' }} />
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Explore Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorMap = {
              blue: 'bg-blue-100 text-blue-600',
              purple: 'bg-purple-100 text-purple-600',
              green: 'bg-green-100 text-green-600',
            };
            
            return (
              <Link
                key={index}
                to={feature.link}
                className="bg-white rounded-lg shadow-md p-8 hover:shadow-xl transition-shadow"
              >
                <div className={`w-16 h-16 ${colorMap[feature.color]} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon style={{ width: '32px', height: '32px' }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Complete your risk profile to receive personalized insurance recommendations
          </p>
          <Link
            to="/profile"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Update Your Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
