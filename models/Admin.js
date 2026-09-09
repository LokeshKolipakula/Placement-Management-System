const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;