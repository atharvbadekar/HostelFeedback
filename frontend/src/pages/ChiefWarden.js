import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Filter, Download, LogOut, Search, Star, BarChart3, Users, UserPlus } from 'lucide-react';
import axios from 'axios';
import StaffManagement from './StaffManagement';

const ChiefWarden = ({ onLogout }) => {
    const [hostelId, setHostelId] = useState(1);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analytics', or 'management'

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`http://localhost:5000/api/hostel/${hostelId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(res.data);
            } catch (err) {
                console.error("Unauthorized Access Detected");
            }
        };
        fetchData();
    }, [hostelId]);

    // Calculate Analytics Data
    const submittedFeedback = students.filter(s => s.feedback?.isSubmitted);
    const totalStudents = students.length;
    const feedbackCount = submittedFeedback.length;
    const avgHostelRating = feedbackCount > 0 
        ? (submittedFeedback.reduce((acc, s) => acc + (s.feedback.answers.reduce((a, b) => a + b, 0) / 5), 0) / feedbackCount).toFixed(1)
        : 0;

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.collegeId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar - Deep University Teal */}
            <aside className="w-72 bg-[#1E3A3A] p-8 hidden lg:flex flex-col text-white shadow-xl">
                <div className="flex items-center gap-3 mb-12">
                    <div className="bg-white/10 p-2 rounded-xl text-white">
                        <LayoutDashboard size={24} />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Chief Admin</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4 px-4">Management</div>
                    
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all ${activeTab === 'overview' ? 'bg-white/20 shadow-inner' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all ${activeTab === 'analytics' ? 'bg-white/20 shadow-inner' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                        Analytics
                    </button>

                    <button 
                        onClick={() => setActiveTab('management')}
                        className={`w-full text-left px-5 py-4 rounded-xl font-medium transition-all ${activeTab === 'management' ? 'bg-white/20 shadow-inner' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                    >
                        Staff Management
                    </button>
                </nav>

                <button onClick={onLogout} className="flex items-center gap-3 px-5 py-4 text-rose-300 font-bold hover:bg-rose-500/10 rounded-xl transition-all mt-auto">
                    <LogOut size={20} /> Sign Out
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-[#212529] tracking-tight">
                            {activeTab === 'overview' ? 'System Overview' : 
                             activeTab === 'analytics' ? 'Performance Analytics' : 
                             'Staff Records'}
                        </h1>
                        <p className="text-[#6B705C] font-medium mt-1">Hostel {hostelId} Administration Portal</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#1E3A3A] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-[#152929] transition-all active:scale-95">
                        <Download size={18} /> Export Data
                    </button>
                </header>

                {/* Tab Rendering Logic */}
                {activeTab === 'management' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StaffManagement />
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                            <div className="bg-white p-4 rounded-xl border border-[#E9ECEF] shadow-sm flex items-center gap-4">
                                <div className="p-2 bg-[#F8F9FA] text-[#1E3A3A] rounded-lg"><Filter size={20} /></div>
                                <select className="bg-transparent font-bold text-[#495057] outline-none w-full cursor-pointer" onChange={(e) => setHostelId(e.target.value)}>
                                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>Hostel {n}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2 bg-white p-4 rounded-xl border border-[#E9ECEF] shadow-sm flex items-center gap-4">
                                <div className="p-2 text-slate-400"><Search size={20} /></div>
                                <input 
                                    type="text" 
                                    placeholder="Search ID or Student Name..." 
                                    className="bg-transparent font-medium text-[#495057] outline-none w-full" 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                            </div>
                        </div>

                        {/* Student Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-[#E9ECEF] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#F8F9FA] border-b border-[#E9ECEF] font-bold text-[11px] text-[#6B705C] uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Student</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-center">Avg Rating</th>
                                        <th className="px-8 py-5">Comments</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E9ECEF]">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((s, i) => (
                                            <tr key={i} className="hover:bg-[#F8F9FA] transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-[#212529]">{s.name}</div>
                                                    <div className="text-xs text-[#6B705C] font-mono">{s.collegeId}</div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-4 py-1.5 rounded-lg text-[10px] font-bold ${s.feedback?.isSubmitted ? 'bg-[#E7F5EF] text-[#1E3A3A]' : 'bg-[#FFF4E5] text-[#B25E09]'}`}>
                                                        {s.feedback?.isSubmitted ? 'SUBMITTED' : 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-center font-black text-[#1E3A3A]">
                                                    {s.feedback?.isSubmitted ? (s.feedback.answers.reduce((a,b)=>a+b,0)/5).toFixed(1) : '—'}
                                                </td>
                                                <td className="px-8 py-5 text-[#6B705C] text-sm italic truncate max-w-[200px]">
                                                    {s.feedback?.comments || "No comments yet"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-20 text-center text-[#6B705C]">No students found in this hostel.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E9ECEF]">
                                <Users className="text-[#1E3A3A] mb-4 opacity-70" size={28} />
                                <h3 className="text-[#6B705C] text-xs font-bold uppercase tracking-widest">Total Students</h3>
                                <p className="text-4xl font-bold text-[#212529] mt-2">{totalStudents}</p>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E9ECEF]">
                                <Star className="text-amber-500 mb-4 opacity-70" size={28} />
                                <h3 className="text-[#6B705C] text-xs font-bold uppercase tracking-widest">Avg Satisfaction</h3>
                                <p className="text-4xl font-bold text-[#212529] mt-2">{avgHostelRating} <span className="text-sm text-[#6B705C] font-normal">/ 5.0</span></p>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E9ECEF]">
                                <BarChart3 className="text-[#1E3A3A] mb-4 opacity-70" size={28} />
                                <h3 className="text-[#6B705C] text-xs font-bold uppercase tracking-widest">Responses</h3>
                                <p className="text-4xl font-bold text-[#212529] mt-2">{feedbackCount}</p>
                            </div>
                        </div>

                        {/* Distribution Chart */}
                        <div className="bg-white p-10 rounded-xl shadow-sm border border-[#E9ECEF]">
                            <h3 className="text-xl font-bold text-[#212529] mb-8">Hostel Satisfaction Distribution</h3>
                            <div className="space-y-6">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = submittedFeedback.filter(s => Math.round(s.feedback.answers.reduce((a,b)=>a+b,0)/5) === star).length;
                                    const percentage = feedbackCount > 0 ? (count / feedbackCount) * 100 : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-6">
                                            <span className="w-16 text-sm font-bold text-[#6B705C]">{star} Star</span>
                                            <div className="flex-1 h-3 bg-[#F8F9FA] rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-[#1E3A3A] transition-all duration-1000 ease-out" 
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-12 text-right text-sm font-bold text-[#212529]">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChiefWarden;