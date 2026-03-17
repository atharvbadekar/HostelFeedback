// backend/routes/admin.js
router.get('/view-hostel/:id', async (req, res) => {
    const students = await Student.find({ hostelId: req.params.id });
    res.json(students);
});