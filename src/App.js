import Policies from "./policies";
import './App.css';
import { useState } from 'react';
import axios from 'axios';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/login', {
        username,
        password
      });

      if (response.data.status === 'success') {
  setLoggedIn(true);
}
 else {
        setMessage('Login Failed! Check username or password.');
      }
    } catch (error) {
      setMessage('Error connecting to backend. Please try again.');
      console.error(error);
    }
  };

  return (
  <>
    {loggedIn ? (
      <Policies />
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">PolicyNest</h1>
          <p className="text-center text-gray-600 mb-6">Your Smart Insurance Companion</p>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-6 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </button>

          <p className="mt-4 text-center text-gray-700">{message}</p>
        </div>
      </div>
    )}
  </>
);

}

export default App;





