import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import { policiesAPI } from '../services/api';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    policy_type: '',
    min_premium: '',
    max_premium: '',
  });

  // NEW: comparison state
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async (filterParams = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterParams.policy_type) params.policy_type = filterParams.policy_type;
      if (filterParams.min_premium) params.min_premium = Number(filterParams.min_premium);
      if (filterParams.max_premium) params.max_premium = Number(filterParams.max_premium);

      const response = await policiesAPI.getPolicies(params);
      setPolicies(response.data);
    } catch (err) {
      setError('Failed to fetch policies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApplyFilters = () => {
    fetchPolicies(filters);
  };

  const handleClearFilters = () => {
    setFilters({ policy_type: '', min_premium: '', max_premium: '' });
    fetchPolicies();
  };

  // NEW: toggle selection for comparison
  const toggleSelect = (policy) => {
    const exists = selected.find((p) => p.id === policy.id);

    if (exists) {
      setSelected(selected.filter((p) => p.id !== policy.id));
    } else {
      if (selected.length >= 3) {
        alert('You can compare only up to 3 policies.');
        return;
      }
      setSelected([...selected, policy]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Policies</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <Filter style={{ width: '20px', height: '20px', color: '#2563eb', marginRight: '8px' }} />
            <h2 className="text-lg font-semibold text-gray-900">Filter Policies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Type
              </label>
              <select
                name="policy_type"
                value={filters.policy_type}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="health">Health</option>
                <option value="life">Life</option>
                <option value="auto">Auto</option>
                <option value="home">Home</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Premium (₹)
              </label>
              <input
                type="number"
                name="min_premium"
                value={filters.min_premium}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Premium (₹)
              </label>
              <input
                type="number"
                name="max_premium"
                value={filters.max_premium}
                onChange={handleFilterChange}
                placeholder="100000"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Policies List */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading policies...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">No policies found matching your criteria.</p>
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">

                  {/* Compare Checkbox */}
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={selected.some((p) => p.id === policy.id)}
                      onChange={() => toggleSelect(policy)}
                    />
                    <span className="text-sm text-gray-700">Compare</span>
                  </label>

                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold uppercase">
                      {policy.policy_type}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{policy.premium.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {policy.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-medium text-gray-900">{policy.provider.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Term:</span>
                      <span className="font-medium text-gray-900">{policy.term_months} months</span>
                    </div>
                    {policy.deductible && (
                      <div className="flex justify-between">
                        <span>Deductible:</span>
                        <span className="font-medium text-gray-900">
                          ₹{policy.deductible.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <button className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700">
                    View Details
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* COMPARISON TABLE */}
        {selected.length >= 2 && (
          <div className="mt-16 overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Policy Comparison</h2>

            <table className="min-w-full bg-white border rounded-lg shadow-md">
              <thead>
                <tr>
                  <th className="px-4 py-3 border font-semibold text-left bg-gray-100">
                    Feature
                  </th>
                  {selected.map((p) => (
                    <th
                      key={p.id}
                      className="px-4 py-3 border font-semibold text-center bg-gray-100"
                    >
                      {p.title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="px-4 py-3 border font-medium">Policy Type</td>
                  {selected.map((p) => (
                    <td key={p.id} className="px-4 py-3 border text-center">
                      {p.policy_type}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-4 py-3 border font-medium">Premium</td>
                  {selected.map((p) => (
                    <td key={p.id} className="px-4 py-3 border text-center">
                      ₹{p.premium.toLocaleString()}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-4 py-3 border font-medium">Provider</td>
                  {selected.map((p) => (
                    <td key={p.id} className="px-4 py-3 border text-center">
                      {p.provider.name}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-4 py-3 border font-medium">Term</td>
                  {selected.map((p) => (
                    <td key={p.id} className="px-4 py-3 border text-center">
                      {p.term_months} months
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="px-4 py-3 border font-medium">Deductible</td>
                  {selected.map((p) => (
                    <td key={p.id} className="px-4 py-3 border text-center">
                      {p.deductible ? `₹${p.deductible.toLocaleString()}` : '—'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <button
              onClick={() => setSelected([])}
              className="mt-6 w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
            >
              Clear Comparison
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Policies;
