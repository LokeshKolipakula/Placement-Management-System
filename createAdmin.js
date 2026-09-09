require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("MongoDB Atlas connected");
})
.catch((err) => {
    console.log(err);
});

async function createAdmin() {
    try {
        const hashedPassword = await bcrypt.hash("process.env.adminPass", 10);

        await Admin.create({
            name: "TPO Admin",
            email: "admin@vitap.ac.in",
            password: hashedPassword
        });

        console.log("Admin Created Successfully");
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit();
    }
}

createAdmin();