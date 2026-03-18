import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
  // Use a single object for credentials to keep it clean
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = process.env.NODE_ENV === 'production' 
    ? 'https://hostelfeedback.onrender.com' 
    : 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FIX: Extract username and password from the 'creds' state object
      const res = await axios.post(`${API_URL}/api/login/staff`, { 
        username: creds.username, 
        password: creds.password 
      });

      if (res.data.token) {
        // 1. Save token and role for persistent login
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);
        
        // 2. Update the parent state
        setUser(res.data);

        // 3. Redirect based on role (Warden or Admin)
        if (res.data.role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/warden-dashboard');
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-800">Hostel Staff Access</h2>
          <p className="text-slate-500 text-sm mt-2">Central University of Rajasthan</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Username</label>
            <input 
              type="text" 
              placeholder="Enter username" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={e => setCreds({...creds, username: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 ml-2 uppercase">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              onChange={e => setCreds({...creds, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Login to Dashboard"}
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="text-slate-400 text-sm hover:text-indigo-600 transition-colors"
          >
            ← Back to Student Portal
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
