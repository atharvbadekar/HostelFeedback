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
    const [selectedStudent, setSelectedStudent] = useState(null); // The "Pop-up" state
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

    // --- PDF EXPORT FUNCTION ---
    const downloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Student Name", "ID", "Hostel", "Avg Rating", "Date"];
        const tableRows = [];

        // Only include students who actually submitted feedback
        filteredStudents.filter(s => s.feedback?.isSubmitted).forEach(s => {
            const avg = s.feedback.answers?.length > 0 
                ? (s.feedback.answers.reduce((a, b) => a + b, 0) / s.feedback.answers.length).toFixed(1)
                : "0.0";

            const rowData = [
                s.name,
                s.collegeId,
                `Hostel ${s.hostelId}`,
                avg,
                s.feedback.submittedAt ? new Date(s.feedback.submittedAt).toLocaleDateString() : 'N/A'
            ];
            tableRows.push(rowData);
        });

        doc.setFontSize(18);
        doc.text("CURAJ Mega Mess Feedback Report", 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillStyle: [30, 58, 58] } // Matches your dark green theme
        });
        
        doc.save(`CURAJ_Feedback_Report.pdf`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans text-slate-800 relative">
            <div className="max-w-7xl mx-auto">
                
                {/* --- HEADER --- */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl text-white ${role === 'chief' ? 'bg-amber-500' : 'bg-indigo-600'}`}>
                            {role === 'chief' ? <LayoutDashboard size={28} /> : <ShieldCheck size={28} />}
                        </div>
                        <div>
                            <h1 className="text-xl font-black">{role === 'chief' ? "Chief Warden Portal" : `Hostel ${hostelId} Warden`}</h1>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">CURAJ Management</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={downloadPDF} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-100">
                            <FileText size={16} /> Export PDF
                        </button>
                        <button onClick={onLogout} className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* --- SEARCH --- */}
                <div className="relative mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                        type="text" placeholder="Search name or ID..."
                        className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* --- TABS --- */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button onClick={() => setView('list')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${view === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-slate-400 border'}`}>
                        Student List
                    </button>
                    <button onClick={() => setView('feedback')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${view === 'feedback' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border'}`}>
                        Analysis
                    </button>
                    {(role === 'chief' || role === 'admin') && (
                        <button onClick={() => setView('manage-wardens')} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tighter transition-all ${view === 'manage-wardens' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400 border'}`}>
                            Wardens
                        </button>
                    )}
                </div>

                {/* --- TABLE --- */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4 text-center">Avg</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((s, i) => (
                                <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedStudent(s)} className="text-left">
                                            <p className="font-bold text-slate-800 hover:text-indigo-600 cursor-pointer">{s.name}</p>
                                            <p className="text-[9px] text-slate-400 font-mono uppercase">{s.collegeId}</p>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {s.feedback?.isSubmitted ? (
                                            <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-black text-xs">
                                                <Star size={10} fill="currentColor" />
                                                {(s.feedback.answers.reduce((a,b)=>a+b,0)/10).toFixed(1)}
                                            </div>
                                        ) : <span className="text-slate-200">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[9px] font-black uppercase ${s.feedback?.isSubmitted ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            {s.feedback?.isSubmitted ? 'Done' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedStudent(s)} className="text-slate-300 hover:text-indigo-600">
                                            <FileText size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- THE MODAL (Pop-up) --- */}
                {selectedStudent && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900">{selectedStudent.name}</h2>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{selectedStudent.collegeId}</p>
                                </div>
                                <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                                {selectedStudent.feedback?.isSubmitted ? (
                                    <>
                                        <div className="flex gap-4">
                                            <div className="bg-indigo-50 p-3 rounded-2xl flex-1 text-center">
                                                <Calendar size={16} className="mx-auto mb-1 text-indigo-500" />
                                                <p className="text-[10px] font-black uppercase text-indigo-300">Date</p>
                                                <p className="text-xs font-bold">{new Date(selectedStudent.feedback.submittedAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="bg-emerald-50 p-3 rounded-2xl flex-1 text-center">
                                                <Clock size={16} className="mx-auto mb-1 text-emerald-500" />
                                                <p className="text-[10px] font-black uppercase text-emerald-300">Time</p>
                                                <p className="text-xs font-bold">{new Date(selectedStudent.feedback.submittedAt).toLocaleTimeString()}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Full Ratings (1-10)</p>
                                            <div className="grid grid-cols-5 gap-2">
                                                {selectedStudent.feedback.answers.map((ans, idx) => (
                                                    <div key={idx} className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                                                        <p className="text-[8px] font-bold text-slate-400">Q{idx+1}</p>
                                                        <p className="text-sm font-black text-indigo-600">{ans}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Comments</p>
                                            <div className="p-4 bg-slate-50 rounded-2xl border italic text-sm text-slate-600">
                                                "{selectedStudent.feedback.comments || "No comments provided."}"
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-10">
                                        <Users className="mx-auto text-slate-200 mb-2" size={40} />
                                        <p className="text-slate-400 text-sm font-bold">Feedback not yet submitted.</p>
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