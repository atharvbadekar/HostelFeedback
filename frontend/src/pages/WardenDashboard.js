import React, { useState, useEffect } from 'react';
import { Upload, ShieldCheck, LogOut, Star, MessageSquare, UserPlus, Users, LayoutDashboard, Search } from 'lucide-react';
import axios from 'axios';

const WardenDashboard = ({ hostelId, onLogout }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); 
    const [loading, setLoading] = useState(true);
    const [newWarden, setNewWarden] = useState({ username: '', password: '', hostelId: '' });

    const role = localStorage.getItem('role'); 

    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://hostelfeedback.onrender.com';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/admin/students`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // --- DATA FILTERING LOGIC ---
                if (role === 'chief' || role === 'admin') {
                    // Chief sees everyone
                    setStudents(res.data);
                } else {
                    // Warden only sees students matching their hostelId
                    const filtered = res.data.filter(s => Number(s.hostelId) === Number(hostelId));
                    setStudents(filtered);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [API_URL, hostelId, role]);

    // --- SEARCH FILTERING ---
    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.collegeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const jsonData = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                return headers.reduce((obj, header, i) => {
                    obj[header] = values[i];
                    return obj;
                }, {});
            }).filter(row => row.collegeId);

            try {
                const token = localStorage.getItem('token');
                await axios.post(`${API_URL}/api/warden/upload`, {
                    students: jsonData,
                    hostelId: hostelId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert("Upload Success!");
                window.location.reload();
            } catch (err) {
                alert("Upload Failed.");
            }
        };
        reader.readAsText(file);
    };

    const handleCreateWarden = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/create-warden`, newWarden, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Warden Created Successfully!");
            setView('list');
        } catch (err) {
            alert("❌ Failed to create warden.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* --- HEADER --- */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl text-white shadow-lg ${role === 'chief' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                            {role === 'chief' ? <LayoutDashboard /> : <ShieldCheck />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">
                                {role === 'chief' ? "Chief Warden Portal" : `Hostel ${hostelId} Warden`}
                            </h1>
                            <p className="text-slate-500 text-sm font-medium">CURAJ Management System</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>

                {/* --- SEARCH BAR --- */}
                <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by student name or college ID..."
                        className="w-full pl-16 pr-6 py-5 bg-white rounded-[2rem] shadow-sm border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* --- STATS & UPLOAD --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Upload size={20}/></div>
                            <h2 className="font-bold text-slate-800">Bulk Enrollment</h2>
                        </div>
                        <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileUpload} />
                        <label htmlFor="csv-upload" className="block w-full text-center py-3 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest transition-all">
                            Choose Student CSV
                        </label>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Students Found</p>
                        <p className="text-4xl font-black text-slate-900">{filteredStudents.length}</p>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Feedback Submitted</p>
                        <p className="text-4xl font-black text-emerald-500">
                            {filteredStudents.filter(s => s.feedback?.isSubmitted).length}
                        </p>
                    </div>
                </div>

                {/* --- TAB NAVIGATION --- */}
                <div className="flex gap-4 mb-6">
                    <button onClick={() => setView('list')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500'}`}>
                        Student List
                    </button>
                    <button onClick={() => setView('feedback')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
                        Feedback Data
                    </button>
                    {(role === 'chief' || role === 'admin') && (
                        <button onClick={() => setView('manage-wardens')} className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all ${view === 'manage-wardens' ? 'bg-amber-500 text-white' : 'bg-white text-slate-500'}`}>
                            Manage Wardens
                        </button>
                    )}
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    {view === 'list' && (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Name</th>
                                    <th className="px-8 py-4">ID</th>
                                    <th className="px-8 py-4">Hostel</th>
                                    <th className="px-8 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.map((s, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="px-8 py-4 font-bold text-slate-700">{s.name}</td>
                                        <td className="px-8 py-4 text-slate-500 font-mono text-xs">{s.collegeId}</td>
                                        <td className="px-8 py-4 text-slate-500 text-sm">Hostel {s.hostelId}</td>
                                        <td className="px-8 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${s.feedback?.isSubmitted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {s.feedback?.isSubmitted ? 'SUBMITTED' : 'PENDING'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {view === 'feedback' && (
                        <table className="w-full text-left">
                            <thead className="bg-indigo-50/50 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Student</th>
                                    <th className="px-8 py-4 text-center">Rating</th>
                                    <th className="px-8 py-4">Comments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredStudents.filter(s => s.feedback?.isSubmitted).map((s, i) => (
                                    <tr key={i}>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-800">{s.name}</p>
                                            <p className="text-xs text-slate-400">{s.collegeId} (Hostel {s.hostelId})</p>
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 w-16 mx-auto py-1 rounded-lg font-black">
                                                <Star size={14} fill="currentColor" />
                                                {(s.feedback.answers.reduce((a,b)=>a+b,0)/5).toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 italic text-slate-500 text-sm">
                                            "{s.feedback.comments || "No comments provided."}"
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {view === 'manage-wardens' && (
                        <div className="p-8 max-w-xl mx-auto space-y-4">
                            <h3 className="text-2xl font-black text-slate-800 text-center mb-6">Create Warden Access</h3>
                            <input type="text" placeholder="Username" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" onChange={(e) => setNewWarden({...newWarden, username: e.target.value})} />
                            <input type="number" placeholder="Hostel ID" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" onChange={(e) => setNewWarden({...newWarden, hostelId: e.target.value})} />
                            <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" onChange={(e) => setNewWarden({...newWarden, password: e.target.value})} />
                            <button onClick={handleCreateWarden} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold shadow-lg">Register Warden</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WardenDashboard;