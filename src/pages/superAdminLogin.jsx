import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loginType, setLoginType] = useState('sysadmin'); // 'sysadmin' | 'employee'
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Countdown Timer Logic
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      
      let payload;
      if (loginType === 'sysadmin') {
        payload = { email, password, loginType: 'sysadmin' };
      } else {
        payload = step === 1 ? { email, loginType: 'employee' } : { email, otp, loginType: 'employee' };
      }
      console.log(`Sending login request to: ${API_BASE_URL}/login`);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
        if (loginType === 'sysadmin') {
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('superadmin_token', data.token);
            if (onLoginSuccess) onLoginSuccess(data.token);
            navigate('/dashboard');
          } else {
            throw new Error("Unexpected response from server.");
          }
        } else {
          if (step === 1 && data.step === 'verify') {
            setStep(2);
            setCountdown(60); // Start 60-second countdown
          } else if (step === 2 && data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('superadmin_token', data.token); // Crucial for SuperAdminMainpanel checks
            if (onLoginSuccess) onLoginSuccess(data.token);
            navigate('/dashboard');
          } else {
            throw new Error("Unexpected response from server.");
          }
        }
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      console.error("Login caught error:", err);
      setError(err.message || 'Failed to connect to the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setLoading(true);

    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, loginType: 'employee' })
      });

      const data = await response.json();

      if (response.ok) {
        setCountdown(60); // Reset timer to 60 seconds
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to connect to the server. Is the backend running?');
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

        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => { setLoginType('sysadmin'); setStep(1); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${loginType === 'sysadmin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Sysadmin Login
          </button>
          <button
            type="button"
            onClick={() => { setLoginType('employee'); setStep(1); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${loginType === 'employee' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Employee Login
          </button>
        </div>

        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold text-center border border-red-100">{error}</div>}

        {loginType === 'sysadmin' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Admin Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" placeholder="admin@galibrand.cloud" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-4 shadow-lg shadow-blue-200">
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        ) : step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Employee Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" placeholder="employee@galibrand.cloud" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-4 shadow-lg shadow-blue-200">
              {loading ? 'Sending OTP...' : 'Send Login OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">6-Digit OTP</label>
              <p className="text-xs text-slate-500 mb-3">We sent a code to <span className="font-bold text-slate-800">{email}</span>.</p>
              <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition text-center text-2xl tracking-[0.5em] font-bold" placeholder="••••••" />
            </div>
            
            <div className="flex justify-between items-center px-1">
              <p className="text-sm font-semibold text-slate-500">Didn't receive the code?</p>
              <button 
                type="button" 
                onClick={handleResendOtp} 
                disabled={countdown > 0 || loading} 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 transition disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-70 mt-4 shadow-lg shadow-blue-200">
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setOtp(''); setCountdown(0); }} className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition">
              Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SuperAdminLogin;