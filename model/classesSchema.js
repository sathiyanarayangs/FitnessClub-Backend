const mongoose = require('mongoose');

const classesSchema = new mongoose.Schema({

    courseID: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    days: {
        type: String,
        required: true
    },
    timing: {
        type: String,
        required: true
    },
    instructorEmail: {
        type: String,
        required: true
    },
    instructorName: {
        type: String,
        required: true
    },
    instructorJobtitle: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description:
    {
        type: String,
        required: true
    }
});

const Classes = mongoose.model('CLASSES', classesSchema);

module.exports = Classes;