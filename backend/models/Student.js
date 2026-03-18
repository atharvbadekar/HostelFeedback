const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    collegeId: { type: String, required: true, unique: true },
    email: { type: String },
    mobile: { type: String },
    hostelId: { type: String },
    otp: { type: String },
    feedback: {
        isSubmitted: { type: Boolean, default: false },
        answers: { type: [Number], default: [] },
        comments: { type: String, default: "" },
        submittedAt: { type: Date }
    }
});

module.exports = mongoose.model('Student', StudentSchema);