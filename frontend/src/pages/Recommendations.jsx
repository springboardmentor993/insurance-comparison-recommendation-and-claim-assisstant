import { useState, useEffect } from 'react';
import { Star, Sparkles, Award, Info } from 'lucide-react';
import Navbar from '../components/Navbar';
import { recommendationsAPI } from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const [generateForm, setGenerateForm] = useState({
    policy_type: '',
    budget: '',
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await recommendationsAPI.getMyRecommendations();
      setRecommendations(response.data);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to fetch recommendations.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setError('');

    try {
      const payload = {};
      
      // Only add policy_type if provided (backend will use user's preference if empty)
      if (generateForm.policy_type) {
        payload.policy_type = generateForm.policy_type;
      }
      
      // Only add budget if provided (backend will use user's budget if empty)
      if (generateForm.budget) {
        payload.budget = parseFloat(generateForm.budget);
      }
      
      const response = await recommendationsAPI.generate(payload);
      setRecommendations(response.data);
      setSuccess('Recommendations generated successfully!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate recommendations. Please complete your risk profile and set preferences first.');
    } finally {
      setGenerating(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const [success, setSuccess] = useState('');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Policy Recommendations</h1>

        {/* Generate Recommendations Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Sparkles style={{ width: '20px', height: '20px', color: '#2563eb', marginRight: '8px' }} />
            <h2 className="text-lg font-semibold text-gray-900">Generate Personalized Recommendations</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 flex items-start">
            <Info style={{ width: '20px', height: '20px', color: '#2563eb', marginRight: '8px', marginTop: '2px', flexShrink: 0 }} />
            <p className="text-sm text-blue-900">
              <strong>Smart Recommendations:</strong> Leave fields empty to use your saved preferences from your profile. 
              Or override them here for this search.
            </p>
          </div>
          
          <form onSubmit={handleGenerateRecommendations} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Type <span className="text-gray-500">(Optional)</span>
              </label>
              <select
                value={generateForm.policy_type}
                onChange={(e) => setGenerateForm({ ...generateForm, policy_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Use my preference</option>
                <option value="health">Health</option>
                <option value="life">Life</option>
                <option value="auto">Auto</option>
                <option value="home">Home</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₹) <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="number"
                value={generateForm.budget}
                onChange={(e) => setGenerateForm({ ...generateForm, budget: e.target.value })}
                placeholder="Use my saved budget"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={generating}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {generating ? 'Generating...' : 'Generate Recommendations'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {/* Recommendations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading recommendations...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Award style={{ width: '64px', height: '64px', color: '#9ca3af', margin: '0 auto 16px' }} />
                <p className="text-gray-600 mb-4">No recommendations yet.</p>
                <p className="text-sm text-gray-500">Generate recommendations based on your risk profile and preferences.</p>
              </div>
            ) : (
              recommendations.map((rec, index) => (
                <div key={rec.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{rec.title}</h3>
                        <p className="text-sm text-gray-600">{rec.provider.name}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full font-semibold mb-2 ${getScoreColor(rec.score)}`}>
                        <Star style={{ width: '16px', height: '16px', marginRight: '4px' }} />
                        Score: {rec.score.toFixed(1)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">₹{rec.premium.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                      {rec.policy_type}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Why this policy?</p>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
