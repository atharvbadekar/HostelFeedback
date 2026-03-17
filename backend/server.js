require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios'); // Add this line here

const app = express();
app.use(cors({
    origin: "*", // This allows any website to talk to your backend (best for testing)
    methods: ["GET", "POST"]
  }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "7MBg44K336q8J1pWCCGjFMYOOikFa6Si8id5eLkIrcC";

// --- SCHEMAS ---

const StudentSchema = new mongoose.Schema({
    collegeId: { type: String, unique: true, required: true },
    name: String,
    email: String,
    mobile: String,
    hostelId: Number,
    otp: String, 
    feedback: {
        answers: [Number],
        comments: String,
        isSubmitted: { type: Boolean, default: false }
    }
});
const Student = mongoose.model('Student', StudentSchema);

const WardenSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    hostelId: { type: Number, required: true }
});
const Warden = mongoose.model('Warden', WardenSchema);

// --- CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🚀 Secure Connection to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- MIDDLEWARE ---
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid Token" });
    }
};

// --- STAFF ROUTES ---

app.post('/api/login/staff', async (req, res) => {
    const { username, password } = req.body;
    
    if (username === "admin" && password === "admin123") {
        const token = jwt.sign({ role: 'chief' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token, role: 'chief' });
    }

    const warden = await Warden.findOne({ username });
    if (warden) {
        const isMatch = await bcrypt.compare(password, warden.password);
        if (isMatch) {
            const token = jwt.sign(
                { id: warden._id, role: 'warden', hostelId: warden.hostelId },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            return res.json({ token, role: 'warden', hostelId: warden.hostelId });
        }
    }
    res.status(401).json({ message: "Invalid Credentials" });
});

app.post('/api/admin/create-warden', protect, async (req, res) => {
    if (req.user.role !== 'chief') return res.status(403).send("Unauthorized");
    try {
        const { username, password, hostelId } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newWarden = new Warden({ username, password: hashedPassword, hostelId });
        await newWarden.save();
        res.status(201).json({ message: "Warden Created" });
    } catch (err) { res.status(400).json({ error: "Username already exists" }); }
});

app.get('/api/admin/wardens', protect, async (req, res) => {
    if (req.user.role !== 'chief') return res.status(403).send("Unauthorized");
    const wardens = await Warden.find({}, '-password');
    res.json(wardens);
});

app.get('/api/hostel/:id', protect, async (req, res) => {
    if (req.user.role !== 'chief' && req.user.hostelId !== parseInt(req.params.id)) {
        return res.status(403).json({ message: "Denied" });
    }
    const students = await Student.find({ hostelId: req.params.id });
    res.json(students);
});

// --- STUDENT ROUTES (LOCAL OTP) ---

app.get('/api/student/:collegeId', async (req, res) => {
    try {
        // .trim() removes any accidental spaces from the input
        const idFromUser = req.params.collegeId.trim();

        // Use a Case-Insensitive search (the 'i' flag)
        const student = await Student.findOne({ 
            collegeId: { $regex: new RegExp("^" + idFromUser + "$", "i") } 
        });

        if (!student) {
            console.log(`❌ Search failed for: "${idFromUser}"`);
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/student/send-otp', async (req, res) => {
    try {
        const { collegeId } = req.body;
        const student = await Student.findOne({ collegeId });

        if (!student || !student.mobile) {
            return res.status(404).json({ error: "Student or mobile number not found" });
        }

        // 1. Clean the number (Must be 10 digits)
        const cleanMobile = student.mobile.toString().replace(/\D/g, '').slice(-10);

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        student.otp = otp;
        await student.save();

        // 3. The "Exact Fix": Use URLSearchParams for clean encoding
        const params = new URLSearchParams({
            authorization: process.env.FAST2SMS_API_KEY,
            route: 'q',
            message: `Your CURAJ OTP is ${otp}`,
            language: 'english',
            flash: '0',
            numbers: cleanMobile
        });

        const url = `https://www.fast2sms.com/dev/bulkV2?${params.toString()}`;

        // 4. Hit the API
        const response = await axios.get(url);

        if (response.data.return) {
            console.log(`✅ Success! OTP ${otp} sent to ${cleanMobile}`);
            res.json({ message: "OTP sent successfully!" });
        } else {
            console.log("❌ Gateway Rejected:", response.data);
            res.status(400).json({ error: response.data.message });
        }

    } catch (err) {
        console.error("--- BACKEND ERROR ---");
        // Check if the error is from Fast2SMS or your own code
        if (err.response) {
            console.error("Fast2SMS Response Error:", err.response.data);
            return res.status(400).json({ error: err.response.data.message });
        }
        console.error("System Error:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/api/student/verify-otp', async (req, res) => {
    const { collegeId, otp } = req.body;
    const student = await Student.findOne({ collegeId, otp });

    if (student) {
        student.otp = null; // Clear it so it can't be reused
        await student.save();
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Invalid OTP" });
    }
});

app.post('/api/student/submit-feedback', async (req, res) => {
    try {
        const { collegeId, answers, comments } = req.body;
        await Student.findOneAndUpdate(
            { collegeId },
            { feedback: { answers, comments, isSubmitted: true } }
        );
        res.json({ message: "Success" });
    } catch (err) { res.status(500).json({ error: "Failed" }); }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));