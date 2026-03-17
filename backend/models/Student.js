// backend/models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    collegeId: { type: String, unique: true, required: true },
    name: String,
    email: String,
    mobile: String,
    hostelId: Number, // 1 to 8
    otp: String,
    feedback: {
        q1: Number,
        q2: Number,
        q3: Number,
        q4: Number,
        comments: String,
        submitted: { type: Boolean, default: false }
    }
});

module.exports = mongoose.model('Student', StudentSchema);