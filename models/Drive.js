const mongoose = require("mongoose");

const driveSchema = new mongoose.Schema({

    companyName: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true
    },

    package: {
        type: Number,
        required: true
    },

    eligibleBranches: [{
        type: String
    }],

    minCGPA: {
        type: Number,
        default: 0
    },

    maxBacklogs: {
        type: Number,
        default: 0
    },

    driveDate: {
        type: Date,
        required: true
    },

    applicationDeadline: {
        type: Date,
        required: true
    },

    location: {
        type: String,
        default: "Not Specified"
    },

    description: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: [
            "Active",
            "Closed"
        ],
        default: "Active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Drive",
    driveSchema
);