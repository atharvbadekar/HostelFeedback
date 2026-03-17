import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setUser }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/login/staff', creds);
      setUser(res.data);
      navigate(res.data.role === 'chief' ? '/chief' : '/warden');
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black mb-6 text-center text-slate-800">Hostel Staff Access</h2>
        <input 
          type="text" placeholder="Username" required
          className="w-full p-4 mb-4 bg-slate-50 border rounded-2xl outline-none"
          onChange={e => setCreds({...creds, username: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" required
          className="w-full p-4 mb-6 bg-slate-50 border rounded-2xl outline-none"
          onChange={e => setCreds({...creds, password: e.target.value})}
        />
        <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">Login</button>
      </form>
    </div>
  );
};

export default Login;