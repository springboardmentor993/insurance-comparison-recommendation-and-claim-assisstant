import { useState, useEffect } from 'react';
import { User, Users, ShieldAlert, CheckCircle, Briefcase, DollarSign, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';
import { profileAPI } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  const [formData, setFormData] = useState({
    dependents: '',
    risk_profile: 'medium',
  });

  const [preferences, setPreferences] = useState({
    income: '',
    budget: '',
    preferred_policy_type: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await profileAPI.getRiskProfile();
      setProfile(response.data);
      setFormData({
        dependents: response.data.dependents.toString(),
        risk_profile: response.data.risk_profile,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        setShowForm(true);
      } else {
        setError('Failed to fetch profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handlePreferenceChange = (e) => {
    setPreferences({ ...preferences, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        dependents: parseInt(formData.dependents),
        risk_profile: formData.risk_profile,
      };

      const response = await profileAPI.createOrUpdateRiskProfile(payload);
      setProfile(response.data);
      setSuccess('Risk profile updated successfully!');
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};
      if (preferences.income) payload.income = parseInt(preferences.income);
      if (preferences.budget) payload.budget = parseInt(preferences.budget);
      if (preferences.preferred_policy_type) payload.preferred_policy_type = preferences.preferred_policy_type;

      await profileAPI.updatePreferences(payload);
      setSuccess('Preferences updated successfully!');
      setShowPreferences(false);
      setPreferences({ income: '', budget: '', preferred_policy_type: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center">
            <CheckCircle style={{ width: '20px', height: '20px', marginRight: '8px' }} />
            {success}
          </div>
        )}

        {/* Current Profile */}
        {!loading && profile && !showForm && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <User style={{ width: '24px', height: '24px', color: '#2563eb', marginRight: '12px' }} />
                <h2 className="text-xl font-semibold text-gray-900">Risk Profile</h2>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Update Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <Users style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '8px' }} />
                  <span className="text-sm font-medium text-gray-600">Number of Dependents</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{profile.dependents}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-3">
                  <ShieldAlert style={{ width: '20px', height: '20px', color: '#6b7280', marginRight: '8px' }} />
                  <span className="text-sm font-medium text-gray-600">Risk Level</span>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full font-semibold text-lg uppercase ${getRiskBadgeColor(profile.risk_profile)}`}>
                  {profile.risk_profile}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> Keep your risk profile updated to receive the most accurate policy recommendations 
                tailored to your needs and family situation.
              </p>
            </div>
          </div>
        )}

        {/* User Preferences Section */}
        {!loading && profile && !showPreferences && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <FileText style={{ width: '24px', height: '24px', color: '#2563eb', marginRight: '12px' }} />
                <h2 className="text-xl font-semibold text-gray-900">Insurance Preferences</h2>
              </div>
              <button
                onClick={() => setShowPreferences(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Update Preferences
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Set your income, budget, and preferred policy type to get better personalized recommendations.
              </p>
              <button
                onClick={() => setShowPreferences(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Configure Preferences →
              </button>
            </div>
          </div>
        )}

        {/* Preferences Form */}
        {showPreferences && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Insurance Preferences</h2>
            
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income (₹)
                  </label>
                  <div className="relative">
                    <Briefcase style={{ width: '20px', height: '20px', color: '#9ca3af', position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="number"
                      name="income"
                      value={preferences.income}
                      onChange={handlePreferenceChange}
                      min="0"
                      placeholder="e.g., 500000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Your yearly income helps us recommend suitable policies</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Premium Budget (₹)
                  </label>
                  <div className="relative">
                    <DollarSign style={{ width: '20px', height: '20px', color: '#9ca3af', position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="number"
                      name="budget"
                      value={preferences.budget}
                      onChange={handlePreferenceChange}
                      min="0"
                      placeholder="e.g., 15000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Maximum amount you're willing to pay per policy</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Policy Type
                </label>
                <select
                  name="preferred_policy_type"
                  value={preferences.preferred_policy_type}
                  onChange={handlePreferenceChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select your preferred type...</option>
                  <option value="health">Health Insurance</option>
                  <option value="life">Life Insurance</option>
                  <option value="auto">Auto Insurance</option>
                  <option value="home">Home Insurance</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  This will be used as default when generating recommendations
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowPreferences(false);
                    setPreferences({ income: '', budget: '', preferred_policy_type: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Profile Form */}
        {(loading || showForm || !profile) && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center mb-6">
              <User style={{ width: '24px', height: '24px', color: '#2563eb', marginRight: '12px' }} />
              <h2 className="text-xl font-semibold text-gray-900">
                {profile ? 'Update Risk Profile' : 'Create Risk Profile'}
              </h2>
            </div>

            <p className="text-gray-600 mb-6">
              Your risk profile helps us provide personalized insurance recommendations. 
              Please fill in the details below to get started.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Dependents
                </label>
                <div className="relative">
                  <Users style={{ width: '20px', height: '20px', color: '#9ca3af', position: 'absolute', left: '12px', top: '12px' }} />
                  <input
                    type="number"
                    name="dependents"
                    value={formData.dependents}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="e.g., 3"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Include spouse, children, parents, or anyone financially dependent on you
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Profile Level
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="risk_profile"
                      value="high"
                      checked={formData.risk_profile === 'high'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">High Risk</span>
                      <p className="text-sm text-gray-600">
                        Pre-existing conditions, high-risk occupation, or need for comprehensive coverage
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="risk_profile"
                      value="medium"
                      checked={formData.risk_profile === 'medium'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Medium Risk</span>
                      <p className="text-sm text-gray-600">
                        Generally healthy with moderate coverage needs
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="risk_profile"
                      value="low"
                      checked={formData.risk_profile === 'low'}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Low Risk</span>
                      <p className="text-sm text-gray-600">
                        Excellent health, safe occupation, minimal coverage requirements
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                </button>
                
                {profile && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
