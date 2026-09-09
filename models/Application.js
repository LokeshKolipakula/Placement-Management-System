const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({

    student: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Student",

        required: true

    },

    drive: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Drive",

        required: true

    },

    status: {

        type: String,

        enum: [

            "Applied",

            "Shortlisted",

            "Rejected",

            "Selected"

        ],

        default: "Applied"

    },

    appliedAt: {

        type: Date,

        default: Date.now

    }

}, {

    timestamps: true

});

module.exports = mongoose.model(
    "Application",
    applicationSchema
);