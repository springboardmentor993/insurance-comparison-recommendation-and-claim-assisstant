// import { useState, useEffect } from 'react';
// import { Calculator as CalcIcon, TrendingUp } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import { policiesAPI } from '../services/api';

// const Calculator = () => {
//   const [policies, setPolicies] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [calculating, setCalculating] = useState(false);
//   const [error, setError] = useState('');
//   const [result, setResult] = useState(null);

//   const [formData, setFormData] = useState({
//     policy_id: '',
//     age: '',
//     coverage_amount: '',
//     term_years: '',
//   });

//   useEffect(() => {
//     fetchPolicies();
//   }, []);

//   const fetchPolicies = async () => {
//     setLoading(true);
//     try {
//       const response = await policiesAPI.getPolicies();
//       setPolicies(response.data);
//     } catch (err) {
//       setError('Failed to fetch policies.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setError('');
//     setResult(null);
//   };

//   const handleCalculate = async (e) => {
//     e.preventDefault();
//     setCalculating(true);
//     setError('');
//     setResult(null);

//     try {
//       const payload = {
//         policy_id: parseInt(formData.policy_id),
//         age: parseInt(formData.age),
//         coverage_amount: parseFloat(formData.coverage_amount),
//         term_years: parseInt(formData.term_years),
//       };

//       const response = await policiesAPI.calculatePremium(payload);
//       setResult(response.data);
//     } catch (err) {
//       setError(err.response?.data?.detail || 'Failed to calculate premium. Please check your inputs.');
//     } finally {
//       setCalculating(false);
//     }
//   };

//   const selectedPolicy = policies.find(p => p.id === parseInt(formData.policy_id));

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
      
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-8">Premium Calculator</h1>

//         <div className="bg-white rounded-lg shadow-md p-8">
//           <div className="flex items-center mb-6">
//             <CalcIcon style={{ width: '24px', height: '24px', color: '#2563eb', marginRight: '12px' }} />
//             <h2 className="text-xl font-semibold text-gray-900">Calculate Your Premium</h2>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleCalculate} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Select Policy</label>
//               <select
//                 name="policy_id"
//                 value={formData.policy_id}
//                 onChange={handleChange}
//                 required
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//               >
//                 <option value="">Choose a policy...</option>
//                 {policies.map((policy) => (
//                   <option key={policy.id} value={policy.id}>
//                     {policy.title} - {policy.policy_type} (Base: ₹{policy.premium.toLocaleString()})
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {selectedPolicy && (
//               <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
//                 <p className="text-sm text-blue-900">
//                   <strong>Selected:</strong> {selectedPolicy.title} by {selectedPolicy.provider.name}
//                 </p>
//                 <p className="text-sm text-blue-900 mt-1">
//                   <strong>Base Premium:</strong> ₹{selectedPolicy.premium.toLocaleString()}
//                 </p>
//               </div>
//             )}

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Your Age</label>
//                 <input
//                   type="number"
//                   name="age"
//                   value={formData.age}
//                   onChange={handleChange}
//                   required
//                   min="0"
//                   max="120"
//                   placeholder="e.g., 35"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Coverage Amount (₹)</label>
//                 <input
//                   type="number"
//                   name="coverage_amount"
//                   value={formData.coverage_amount}
//                   onChange={handleChange}
//                   required
//                   min="0"
//                   placeholder="e.g., 500000"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Term (Years)</label>
//                 <input
//                   type="number"
//                   name="term_years"
//                   value={formData.term_years}
//                   onChange={handleChange}
//                   required
//                   min="1"
//                   max="50"
//                   placeholder="e.g., 10"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={calculating || !formData.policy_id}
//               className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
//             >
//               {calculating ? 'Calculating...' : 'Calculate Premium'}
//             </button>
//           </form>

//           {/* Results */}
//           {result && (
//             <div className="mt-8 border-t pt-8">
//               <div className="flex items-center mb-6">
//                 <TrendingUp style={{ width: '24px', height: '24px', color: '#10b981', marginRight: '12px' }} />
//                 <h3 className="text-xl font-semibold text-gray-900">Calculation Results</h3>
//               </div>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center py-3 border-b">
//                   <span className="text-gray-600">Base Premium</span>
//                   <span className="text-xl font-semibold text-gray-900">₹{result.base_premium.toLocaleString()}</span>
//                 </div>

//                 <div className="flex justify-between items-center py-3 border-b">
//                   <span className="text-gray-600">Loading Factor</span>
//                   <span className="text-xl font-semibold text-gray-900">{result.loading_factor.toFixed(2)}x</span>
//                 </div>

//                 <div className="flex justify-between items-center py-4 bg-green-50 rounded-md px-4">
//                   <span className="text-lg font-semibold text-gray-900">Final Premium</span>
//                   <span className="text-3xl font-bold text-green-600">₹{result.final_premium.toLocaleString()}</span>
//                 </div>

//                 <div className="bg-gray-50 rounded-md p-4 mt-4">
//                   <p className="text-sm text-gray-600">
//                     <strong>Note:</strong> This is an estimated premium based on the factors you provided. 
//                     The loading factor accounts for your age, coverage amount, and policy term. 
//                     Final premium may vary based on additional factors during actual policy issuance.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Calculator;
