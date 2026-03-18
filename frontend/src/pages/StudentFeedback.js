import React, { useState } from 'react';
import axios from 'axios';
import { User, KeyRound, Star, Send, CheckCircle2, ChevronRight } from 'lucide-react';

const StudentFeedback = () => {
  const [step, setStep] = useState(1);
  const [collegeId, setCollegeId] = useState('');
  const [otp, setOtp] = useState('');
  const [studentName, setStudentName] = useState('');
  
  // FIXED: Updated to 10 default values to match your new questions list
  const [answers, setAnswers] = useState(new Array(10).fill(5));
  
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://hostelfeedback.onrender.com';

  // Your updated bilingual questions
  const questions = [
    "क्या मेगा मेस में मेन्यु फॉलो किया जा रहा है ? Is the menu being followed at Mega Mess?",
    "मेगा मेस में काउंटर पर खाने की सर्विंग और किचन,डाइनिंग एरिया की साफ़-सफाई कैसी है ? How is the food serving at the counter and the cleanliness of the kitchen and dining area?",
    "मेगा मेस वेंडर के स्टाफ का व्यवहार कैसा है ? How is the behavior of the staff of Mega Mess Vendor?",
    "मेगा मेस में बनने वाली रोटी की गुणवता कैसी है? What is the quality of the aata roti made at Mega Mess?",
    "मेगा मेस में बनने वाली सब्जी की गुणवता कैसी है? What is the quality of vegetables prepared in Mega Mess?",
    "मेगा मेस में बनने वाले चावल की गुणवता कैसी है? What is the quality of rice cooked in Mega Mess?",
    "मेगा मेस में बनने वाले दही रायते की गुणवता कैसी है? What is the quality of curd raita made in Mega Mess?",
    "मेगा मेस में बनने वाली चाय की गुणवता कैसी है? What is the quality of tea made at Mega Mess?",
    "मेगा मेस में बनने वाले सुबह के नाश्ते की गुणवता कैसी है? What is the quality of breakfast prepared in Mega Mess?",
    "दैनिक तौर पर खाने (नाश्ते,दिन के खाने व रात के खाने) की गुणवता कैसी है? What is the daily quality of all meals?"
  ];

  const handleRequestOTP = async () => {
    if (!collegeId) return alert("Please enter your College ID");
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/student/${collegeId}`);
      setStudentName(res.data.name);
      await axios.post(`${API_URL}/api/student/send-otp`, { collegeId });
      setStep(2); 
    } catch (err) {
      alert(err.response?.data?.error || "Student not found or Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/student/verify-otp`, { collegeId, otp });
      if (res.data.success) setStep(3);
    } catch (err) {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post(`${API_URL}/api/student/submit-feedback`, { collegeId, answers, comments });
      setStep(4);
    } catch (err) {
      alert("Submission failed.");
    }
  };

  const updateRating = (index, val) => {
    const newAnswers = [...answers];
    newAnswers[index] = val;
    setAnswers(newAnswers);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-md flex justify-center py-6">
        <img src="/images/curaj-logo.png" alt="CURAJ" className="h-14 object-contain" />
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E9ECEF] p-6 mb-8">
        
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#1E3A3A]">Mega Mess Feedback</h2>
              <p className="text-slate-500 text-sm mt-1">Central University of Rajasthan</p>
            </div>
            <div className="relative">
              <User className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="text" placeholder="College ID (e.g. 2024MSCPY01)"
                className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none focus:ring-2 focus:ring-[#1E3A3A]"
                onChange={(e) => setCollegeId(e.target.value.toUpperCase())}
              />
            </div>
            <button 
              onClick={handleRequestOTP} 
              disabled={loading}
              className="w-full bg-[#1E3A3A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "Verifying..." : "Get Started"} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1E3A3A]">Welcome, {studentName}</h2>
              <p className="text-slate-500 text-sm mt-1">Enter the OTP sent to your mobile</p>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-4 text-slate-400" size={20} />
              <input 
                type="text" placeholder="000000"
                className="w-full pl-12 pr-4 py-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none text-center text-2xl tracking-[0.5em] font-bold focus:ring-2 focus:ring-[#1E3A3A]"
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button onClick={handleVerifyOTP} className="w-full bg-[#1E3A3A] text-white py-4 rounded-xl font-bold">
              Verify OTP
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-[#1E3A3A]">Feedback Form</h2>
              <p className="text-xs text-[#6B705C] font-bold uppercase tracking-widest mt-1">Mess Satisfaction Survey</p>
            </div>

            <div className="space-y-10">
              {questions.map((q, i) => (
                <div key={i} className="space-y-4">
                  <p className="text-[#212529] font-medium text-sm leading-relaxed">
                    <span className="font-bold mr-2 text-indigo-600">{i+1}.</span>{q}
                  </p>
                  <div className="flex justify-between px-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateRating(i, star)}
                        className={`p-1 transition-transform active:scale-125 ${answers[i] >= star ? 'text-amber-500' : 'text-slate-200'}`}
                      >
                        <Star size={32} fill={answers[i] >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4">
              <p className="text-[#212529] font-semibold text-sm">Any other suggestions? (अतिरिक्त सुझाव)</p>
              <textarea 
                className="w-full p-4 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl outline-none h-32 text-sm"
                placeholder="Write here..."
                onChange={(e) => setComments(e.target.value)}
              />
            </div>

            <button onClick={handleSubmit} className="w-full bg-[#1E3A3A] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/10">
              <Send size={18} /> Submit Feedback
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="py-10 text-center space-y-4 animate-in zoom-in">
            <div className="flex justify-center text-emerald-500">
              <CheckCircle2 size={80} />
            </div>
            <h2 className="text-2xl font-bold text-[#1E3A3A]">Thank You!</h2>
            <p className="text-slate-500">Your feedback has been recorded successfully.</p>
            <button onClick={() => window.location.reload()} className="underline text-sm font-bold text-indigo-600">Submit another response</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;