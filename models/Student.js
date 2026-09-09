const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    // Registration Details

    name: {
        type: String,
        required: true
    },

    regNo: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    // Academic Details

    branch: {
        type: String,
        required: true
    },

    cgpa: {
        type: Number,
        default: 0
    },

    tenthPercentage: {
        type: Number,
        default: 0
    },

    twelfthPercentage: {
        type: Number,
        default: 0
    },

    backlogs: {
        type: Number,
        default: 0
    },

    // Personal Details

    phone: {
        type: String,
        default: ""
    },

    gender: {
        type: String,
        default: ""
    },

    dateOfBirth: {
        type: Date
    },

    address: {
        type: String,
        default: ""
    },

    // Skills

    skills: [{
        type: String
    }],

    // Resume

    resume: {
        type: String,
        default: ""
    },

    // Placement Status

    placementStatus: {
        type: String,
        enum: [
            "Not Placed",
            "Placed"
        ],
        default: "Not Placed"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Student",
    studentSchema
);