import React, { useState, useEffect } from 'react';
import { 
  Upload, ShieldCheck, LogOut, Star, MessageSquare, UserPlus, 
  Users, LayoutDashboard, Search, FileText, X, Clock, Calendar, 
  BarChart3, User, Hash, Home, Smartphone 
} from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Import Charting Components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WardenDashboard = ({ hostelId, onLogout }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); 
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newWarden, setNewWarden] = useState({ username: '', password: '', hostelId: '' });

    const role = localStorage.getItem('role'); 
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:5000' 
        : 'https://hostelfeedback.onrender.com';

    const questionLabels = [
        "Menu Followed", "Cleanliness", "Staff Behavior", "Roti Quality", 
        "Veg Quality", "Rice Quality", "Curd/Raita", "Tea Quality", 
        "Breakfast", "Overall Daily"
    ];

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_URL}/api/admin/students`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (role === 'chief' || role === 'admin') {
                    setStudents(res.data);
                } else {
                    const filtered = res.data.filter(s => Number(s.hostelId) === Number(hostelId));
                    setStudents(filtered);
                }
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [API_URL, hostelId, role]);

    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.collegeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- ANALYTICS LOGIC ---
    const getChartData = () => {
        const submitted = students.filter(s => s.feedback?.isSubmitted);
        const averages = new Array(10).fill(0);

        if (submitted.length > 0) {
            submitted.forEach(s => {
                s.feedback.answers.forEach((val, idx) => {
                    averages[idx] += val;
                });
            });
            averages.forEach((val, idx) => averages[idx] = (val / submitted.length).toFixed(1));
        }

        return {
            labels: questionLabels,
            datasets: [{
                label: 'Average Score (out of 5)',
                data: averages,
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderRadius: 8,
            }]
        };
    };

    const handleCreateWarden = async () => {
        if(!newWarden.username || !newWarden.password || !newWarden.hostelId) return alert("Fill all fields");
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/admin/create-warden`, newWarden, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Warden Created Successfully!");
            setNewWarden({ username: '', password: '', hostelId: '' });
        } catch (err) {
            alert("❌ Failed to create warden. Username might exist.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 tracking-widest animate-pulse">CURAJ PORTAL LOADING...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER --- */}
                <header className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl text-white ${role === 'chief' ? 'bg-amber-500 shadow-lg shadow-amber-100' : 'bg-indigo-600 shadow-lg shadow-indigo-100'}`}>
                            {role === 'chief' ? <LayoutDashboard size={24} /> : <ShieldCheck size={24} />}
                        </div>
                        <div>
                            <h1 className="text-xl font-black">{role === 'chief' ? "Chief Warden Dashboard" : `Hostel ${hostelId} Warden`}</h1>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Mega Mess Management System</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors">
                        <LogOut size={20} />
                    </button>
                </header>

                {/* --- NAVIGATION --- */}
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    <button onClick={() => setView('list')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}>
                        <Users size={16} /> Students
                    </button>
                    <button onClick={() => setView('analysis')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'analysis' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}>
                        <BarChart3 size={16} /> Analytics
                    </button>
                    {(role === 'chief' || role === 'admin') && (
                        <button onClick={() => setView('wardens')} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${view === 'wardens' ? 'bg-amber-500 text-white shadow-xl' : 'bg-white text-slate-400 border border-slate-100'}`}>
                            <UserPlus size={16} /> Add Warden
                        </button>
                    )}
                </div>

                {/* --- MAIN CONTENT AREA --- */}
                <main className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-2">
                    
                    {/* VIEW: STUDENT LIST */}
                    {view === 'list' && (
                        <div className="p-4">
                            <div className="relative mb-6">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input 
                                    type="text" placeholder="Search name or ID..."
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Hostel</th>
                                            <th className="px-6 py-4 text-center">Score</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredStudents.map((s, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setSelectedStudent(s)}>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-800">{s.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{s.collegeId}</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">Hostel {s.hostelId}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {s.feedback?.isSubmitted ? (
                                                        <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-black text-xs">
                                                            <Star size={10} fill="currentColor" />
                                                            {(s.feedback.answers.reduce((a,b)=>a+b,0)/10).toFixed(1)}
                                                        </div>
                                                    ) : <span className="text-slate-200">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${s.feedback?.isSubmitted ? 'bg-emerald-50 text-emerald-500' : 'text-slate-300'}`}>
                                                        {s.feedback?.isSubmitted ? 'Submitted' : 'Pending'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* VIEW: ANALYSIS GRAPH */}
                    {view === 'analysis' && (
                        <div className="p-8">
                            <h2 className="text-xl font-black text-slate-800 mb-6">Mess Satisfaction Trends</h2>
                            <div className="h-[400px]">
                                <Bar 
                                    data={getChartData()} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true, max: 5 } }
                                    }} 
                                />
                            </div>
                            <p className="mt-6 text-xs text-slate-400 text-center italic">Calculated based on all submitted student feedback</p>
                        </div>
                    )}

                    {/* VIEW: REGISTER WARDEN */}
                    {view === 'wardens' && (
                        <div className="p-12 max-w-xl mx-auto space-y-6">
                            <div className="text-center mb-8">
                                <div className="inline-flex p-4 bg-amber-50 text-amber-500 rounded-3xl mb-4"><UserPlus size={32}/></div>
                                <h3 className="text-2xl font-black text-slate-800">New Staff Registration</h3>
                                <p className="text-slate-400 text-sm">Assign a warden account to a specific hostel</p>
                            </div>
                            <input type="text" placeholder="Warden Username" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-200 outline-none transition-all" value={newWarden.username} onChange={(e) => setNewWarden({...newWarden, username: e.target.value})} />
                            <input type="number" placeholder="Hostel Number" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-200 outline-none transition-all" value={newWarden.hostelId} onChange={(e) => setNewWarden({...newWarden, hostelId: e.target.value})} />
                            <input type="password" placeholder="Set Password" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-amber-200 outline-none transition-all" value={newWarden.password} onChange={(e) => setNewWarden({...newWarden, password: e.target.value})} />
                            <button onClick={handleCreateWarden} className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-amber-100 active:scale-95 transition-all">Create Account</button>
                        </div>
                    )}
                </main>

                {/* --- STUDENT DETAIL MODAL (PERSONAL DETAILS) --- */}
                {selectedStudent && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
                            <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm border text-indigo-500"><User size={24}/></div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h2>
                                        <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em]">Full Student Profile</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-2xl transition-colors"><X size={24} /></button>
                            </div>
                            
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Details Column */}
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <Hash size={18} className="text-slate-400" />
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase">College ID</p><p className="font-bold text-slate-700">{selectedStudent.collegeId}</p></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <Home size={18} className="text-slate-400" />
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase">Assigned Hostel</p><p className="font-bold text-slate-700">Hostel {selectedStudent.hostelId}</p></div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                                        <Smartphone size={18} className="text-slate-400" />
                                        <div><p className="text-[9px] font-black text-slate-400 uppercase">Contact Number</p><p className="font-bold text-indigo-600">{selectedStudent.mobile || 'Not Linked'}</p></div>
                                    </div>
                                </div>

                                {/* Status Column */}
                                <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex flex-col justify-center items-center text-center">
                                    {selectedStudent.feedback?.isSubmitted ? (
                                        <>
                                            <p className="text-emerald-400 text-[10px] font-black uppercase mb-2">Assessment Completed</p>
                                            <p className="text-4xl font-black mb-1">{(selectedStudent.feedback.answers.reduce((a,b)=>a+b,0)/10).toFixed(1)}</p>
                                            <p className="text-slate-400 text-xs">Average Satisfaction Score</p>
                                            <div className="mt-6 pt-6 border-t border-white/10 w-full text-left flex items-center gap-2">
                                                <Calendar size={14} className="text-slate-500" />
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(selectedStudent.feedback.submittedAt).toLocaleString()}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="opacity-50"><p className="text-xs font-black uppercase">No Feedback Record</p></div>
                                    )}
                                </div>
                            </div>

                            {/* Comment Section in Modal */}
                            {selectedStudent.feedback?.isSubmitted && (
                                <div className="px-8 pb-8">
                                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-sm text-indigo-900">
                                        "{selectedStudent.feedback.comments || "No comments provided."}"
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WardenDashboard;