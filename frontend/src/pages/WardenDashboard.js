import React, { useState, useEffect } from 'react';
import { Upload, ShieldCheck, LogOut, Star, MessageSquare, UserPlus, Users, LayoutDashboard, Search, FileText, X, Clock, Calendar } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const WardenDashboard = ({ hostelId, onLogout }) => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('list'); 
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null); // For the Detail Modal
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

                if (role === 'chief' || role === 'admin') {
                    setStudents(res.data);
                } else {
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

    const filteredStudents = students.filter(s => 
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.collegeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- PDF EXPORT LOGIC ---
    const downloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Student Name", "ID", "Hostel", "Avg Rating", "Date"];
        const tableRows = [];

        filteredStudents.filter(s => s.feedback?.isSubmitted).forEach(s => {
            const rowData = [
                s.name,
                s.collegeId,
                `Hostel ${s.hostelId}`,
                (s.feedback.answers.reduce((a, b) => a + b, 0) / s.feedback.answers.length).toFixed(1),
                s.feedback.submittedAt ? new Date(s.feedback.submittedAt).toLocaleDateString() : 'N/A'
            ];
            tableRows.push(rowData);
        });

        doc.text("CURAJ Mega Mess Feedback Report", 14, 15);
        doc.autoTable(tableColumn, tableRows, { startY: 20 });
        doc.save(`Mess_Feedback_Report_${new Date().toLocaleDateString()}.pdf`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Initializing Portal...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl text-white shadow-lg ${role === 'chief' ? 'bg-amber-500 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'}`}>
                            {role === 'chief' ? <LayoutDashboard size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight">{role === 'chief' ? "Chief Warden Portal" : `Hostel ${hostelId} Warden`}</h1>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Central University of Rajasthan</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm border border-emerald-100 hover:bg-emerald-100">
                            <FileText size={18} /> Export PDF
                        </button>
                        <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm border border-rose-100">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* --- SEARCH --- */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={22} />
                    <input 
                        type="text" placeholder="Search by name or enrollment ID..."
                        className="w-full pl-16 pr-6 py-5 bg-white rounded-[2rem] border border-slate-100 focus:ring-4 focus:ring-indigo-50 shadow-sm outline-none font-medium transition-all"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* --- TABS --- */}
                <div className="flex gap-4 mb-8">
                    <button onClick={() => setView('list')} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-xl' : 'bg-white text-slate-400 border'}`}>
                        Student List
                    </button>
                    <button onClick={() => setView('feedback')} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${view === 'feedback' ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white text-slate-400 border'}`}>
                        Feedback Analysis
                    </button>
                    {(role === 'chief' || role === 'admin') && (
                        <button onClick={() => setView('manage-wardens')} className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${view === 'manage-wardens' ? 'bg-amber-500 text-white shadow-xl' : 'bg-white text-slate-400 border'}`}>
                            Manage Staff
                        </button>
                    )}
                </div>

                {/* --- TABLE CONTENT --- */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-10 py-6">Student Information</th>
                                <th className="px-6 py-6 text-center">Avg Rating</th>
                                <th className="px-6 py-6">Submission Status</th>
                                <th className="px-6 py-6">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((s, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-10 py-5">
                                        <button 
                                            onClick={() => setSelectedStudent(s)}
                                            className="text-left group-hover:translate-x-1 transition-transform"
                                        >
                                            <p className="font-black text-slate-800 hover:text-indigo-600">{s.name}</p>
                                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{s.collegeId} • Hostel {s.hostelId}</p>
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {s.feedback?.isSubmitted ? (
                                            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black text-xs">
                                                <Star size={12} fill="currentColor" />
                                                {(s.feedback.answers.reduce((a,b)=>a+b,0)/10).toFixed(1)}
                                            </div>
                                        ) : <span className="text-slate-200">—</span>}
                                    </td>
                                    <td className="px-6 py-5">
                                        {s.feedback?.isSubmitted ? (
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase">Submitted</span>
                                                <span className="text-[9px] text-slate-400 font-medium">{new Date(s.feedback.submittedAt).toLocaleString()}</span>
                                            </div>
                                        ) : <span className="text-[10px] font-black text-slate-300 uppercase">Pending</span>}
                                    </td>
                                    <td className="px-6 py-5">
                                        <button onClick={() => setSelectedStudent(s)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- STUDENT DETAIL MODAL --- */}
                {selectedStudent && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h2>
                                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{selectedStudent.collegeId}</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-3 bg-white shadow-sm border rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                                {selectedStudent.feedback?.isSubmitted ? (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-indigo-50 p-4 rounded-3xl flex items-center gap-3">
                                                <Calendar className="text-indigo-600" size={20} />
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase">Submitted Date</p>
                                                    <p className="text-sm font-bold text-indigo-900">{new Date(selectedStudent.feedback.submittedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="bg-emerald-50 p-4 rounded-3xl flex items-center gap-3">
                                                <Clock className="text-emerald-600" size={20} />
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase">Submitted Time</p>
                                                    <p className="text-sm font-bold text-emerald-900">{new Date(selectedStudent.feedback.submittedAt).toLocaleTimeString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Individual Ratings</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                {selectedStudent.feedback.answers.map((ans, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <span className="text-xs font-medium text-slate-600 italic">Question {idx + 1}</span>
                                                        <div className="flex gap-1 text-amber-400">
                                                            {[1,2,3,4,5].map(star => (
                                                                <Star key={star} size={12} fill={ans >= star ? "currentColor" : "none"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b pb-2">Student Comments</h4>
                                            <div className="bg-indigo-50/30 p-5 rounded-3xl border border-indigo-100/50 flex gap-3">
                                                <MessageSquare size={20} className="text-indigo-400 shrink-0 mt-1" />
                                                <p className="text-sm text-slate-700 leading-relaxed italic">
                                                    "{selectedStudent.feedback.comments || "No additional suggestions provided."}"
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-20 bg-slate-50 rounded-[2rem]">
                                        <Users className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold">This student has not submitted feedback yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WardenDashboard;


