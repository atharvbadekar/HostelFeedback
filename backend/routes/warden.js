// backend/routes/warden.js
const router = require('express').Router();
const Student = require('../models/Student');

// Bulk Upload Endpoint
router.post('/bulk-upload', async (req, res) => {
    try {
        const { students, hostelId } = req.body; 
        // Add hostelId to each student record before saving
        const dataToSave = students.map(s => ({ ...s, hostelId }));
        await Student.insertMany(dataToSave);
        res.status(200).send("Data uploaded successfully");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;