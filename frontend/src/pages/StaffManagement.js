import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Users, Trash2 } from 'lucide-react';

const StaffManagement = () => {
    const [formData, setFormData] = useState({ username: '', password: '', hostelId: 1 });
    const [wardens, setWardens] = useState([]);

    // Fetch existing wardens to see who is already there
    const fetchWardens = async () => {
        const token = localStorage.getItem('token');
        try {
            // You'll need to create this simple GET route in server.js
            const res = await axios.get('http://localhost:5000/api/admin/wardens', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWardens(res.data);
        } catch (err) { console.error("Error fetching wardens"); }
    };

    useEffect(() => { fetchWardens(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/admin/create-warden', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Warden Registered!");
            fetchWardens(); // Refresh the list
        } catch (err) {
            alert(err.response?.data?.error || "Username already exists. Try a different one.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Form Section */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus/> Register Warden</h2>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Username" className="p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100" 
                    onChange={e => setFormData({...formData, username: e.target.value})} required />
                    
                    <input type="password" placeholder="Password" className="p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100" 
                    onChange={e => setFormData({...formData, password: e.target.value})} required />
                    
                    <select className="p-4 bg-slate-50 rounded-2xl outline-none border border-slate-100"
                    onChange={e => setFormData({...formData, hostelId: parseInt(e.target.value)})}>
                        {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Hostel {n}</option>)}
                    </select>
                    
                    <button className="md:col-span-3 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                        Register Staff Member
                    </button>
                </form>
            </div>

            {/* List Section */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users/> Existing Wardens</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wardens.map((w) => (
                        <div key={w._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-slate-800">{w.username}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hostel {w.hostelId}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;