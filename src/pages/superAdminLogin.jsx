import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      
      console.log(`Sending login request to: ${API_BASE_URL}/login`);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      console.log(`Server responded with status: ${response.status}`);

      // Safely parse JSON to prevent crashes if backend returns HTML (like a 404 page)
      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response from server:", text);
        throw new Error("Server returned an invalid response. Check your backend terminal.");
      }

      if (response.ok) {
        if (!data.token) {
          throw new Error("Login succeeded, but the server didn't return an auth token!");
        }
        localStorage.setItem('token', data.token);
        if (onLoginSuccess) onLoginSuccess(data.token);
        navigate('/dashboard'); // Route to the superadmin dashboard
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (err) {
      console.error("Login caught error:", err);
      setError(err.message || 'Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">Super Admin</h2>
          <p className="text-slate-500 mt-2">Sign in to manage Galibrand Cloud</p>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center border border-red-100">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" placeholder="galibrand99@gmail.com" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Master Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-4 shadow-lg shadow-blue-200">
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;